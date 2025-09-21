import { useEffect, useMemo, useState } from "react";
import { ActionFunctionArgs, Form, LoaderFunctionArgs, useActionData, useLoaderData, useNavigation } from "react-router";
import { commitSession, getOrCreateSession } from "~/sessions.server";
import { getDb } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const { session, userId } = await getOrCreateSession(request);
    const db = await getDb();
    const col = db.collection("expiring_object");

    const wash = await col.findOne({ userId, ["expireAt"]: { $gt: new Date() } });

    let step: Step = 1;
    if (wash && wash.day) step = 2;
    if (wash && wash.selection) step = 3;
    if (wash && wash.paid) step = 4;

    const headers = new Headers({
        "Set-Cookie": await commitSession(session),
    });

    return Response.json({
        step,
        wash,
    }, {
        headers
    });
}

type LoaderData = {
    step: Step;
    wash: WashDoc | null;
};

const bad = (data: any, status = 400) => Response.json({ ok: false, ...data }, { status });

export async function action({ request }: ActionFunctionArgs) {
    const { session, userId } = await getOrCreateSession(request);
    const form = await request.formData();
    const intent = String(form.get("_intent") || "");
    const db = await getDb();
    const col = db.collection("expiring_object");
    const now = new Date();

    if (intent === "BOOK_TIME") {
        const day = form.get("day")?.toString();
        const time = form.get("time")?.toString();

        const errors = {
            day: day? undefined : "Pick a day",
            time: time ? undefined : "Pick a time",
        };

        if (errors.day || errors.time) {
            return bad({ intent, errors });
        }

        const expireAt = new Date(now.getTime() + HOLD_TIME * 1000);
        const res = await col.findOneAndUpdate(
            { userId },
            {
                $set: { userId, day, time, expireAt, updatedAt: now },
                $setOnInsert: { createdAt: now },
            },
            { upsert: true, returnDocument: "after" }
        );

        return Response.json(
            { ok: true, intent, step: 2, doc: res, expireAt },
            {
                headers: { "Set-Cookie": await commitSession(session) },
                status: res?.lastErrorObject?.upserted ? 201 : 200
            }
        );
    }

    if (intent === "SELECT_OPTIONS") {
        const pkgRaw = form.get("package")?.toString() ?? "";
        const vehicle = form.get("vehicle")?.toString();
        const upsells = form.getAll("upsells").map(String);

        const pkg = pkgRaw as keyof typeof WashPackage;

        const errors = {
            pkg: pkg ? undefined : "Choose a package",
            vehicle: vehicle ? undefined : "Choose a vehicle type"
        };

        if (errors.pkg || errors.vehicle) {
            return bad({ intent, errors });
        }

        const expireAt = new Date(now.getTime() + HOLD_TIME * 1000);
        const res = await col.findOneAndUpdate(
            { userId, expireAt: { $gt: now } },
            { $set: { expireAt, updatedAt: now, selection: { pkg, vehicle, upsells } } },
            { returnDocument: "after" }
        );

        if (!res) {
            return bad({ intent, errors: { form: "Hold expired; please pick a time slot again." } }, 409);
        }

        return Response.json(
            { ok: true, intent, step: 3, doc: res, expireAt },
            { headers: { "Set-Cookie": await commitSession(session) } }
        );
    }

    if (intent === "PAYMENT") {
        const current = await col.findOne({ userId, expireAt: { $gt: now } });
        if (!current?.selection) {
            return bad({ intent, errors: { form: "Missing selection or hold expired. Please start again." } }, 409);
        }

        const expireAt = new Date(now.getTime() + (60 * 60 * 24 * 7) * 1000);
        const res = await col.findOneAndUpdate(
            { userId, expireAt: { $gt: now } },
            { $set: { expireAt, updatedAt: now, paid: true } },
            { returnDocument: "after" }
        );

        return Response.json(
            { ok: true, intent, step: 4, doc: res, expireAt },
            { headers: { "Set-Cookie": await commitSession(session) } }
        );
    }

    if (intent === "DELETE_ENTRY") {
        const delRes = await col.deleteOne({ userId });

        return Response.json(
            { ok: true, intent, step: 1, doc: null, deletedCount: delRes.deletedCount ?? 0 },
            { headers: { "Set-Cookie": await commitSession(session) } }
        );
    }

    return bad({ intent, errors: { form: "Unknown action" } }, 400);
}

export default function CarWashBooking() {
    const data = useLoaderData<LoaderData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return(
        <div className="flex flex-col gap-4 items-start my-10">
            <div className="border rounded px-3 py-2 text-center mx-auto">CAR WASH BOOKING</div>

            {data && (
                <div className="mt-5">Step: {data.step}</div>
            )}

            <div className="border border-[#2BA2E3] h-[35px] w-full" style={{ borderRadius: 2, overflow: "hidden", margin: "8px 0 16px" }}>
                <div style={{ width: `${progress(data.step)}%`, height: "100%", background: data.step < 4 ? "#2BA2E3" : "#16a34a" }} />
            </div>

            <Form method="POST" className="mt-3 space-y-3">
                {data.step === 4 ? (
                    <BookedAndPaid />
                ) : (
                    <>
                        {data.step === 1 && (
                            <BookTimeSlot />
                        )}

                        {data.step === 2 && (
                            <WashOptions />
                        )}

                        {data.step === 3 && (
                            <ConfirmPayment />
                        )}
                    </>
                )}
            </Form>
        </div>
    )
}

function ErrorBanner({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
        </div>
    );
}

export function BookedAndPaid() {
    const {wash} = useLoaderData<LoaderData>();

    return(
        <div className="flex flex-col">
            <h1>Booked & Paid!</h1>
            <p>We will see you on {wash?.day} at {wash?.time}.</p>
            
            <div className="flex mt-10 mb-5 items-center justify-center">
                <button type="submit" name="_intent" value="DELETE_ENTRY" className="rounded border bg-red-700 px-4 py-2 text-white hover:opacity-90">Delete Entry</button>
            </div>
        </div>
    );
}

export function ConfirmPayment() {
    const {wash} = useLoaderData<LoaderData>();
    const a = useActionData<{ ok?: boolean; intent?: string; errors?: { form?: string } }>();
    const isStep = a?.intent === "PAYMENT";
    const e = isStep ? a?.errors : undefined;
    
    if (!wash || !wash?.selection) return null;

    const usd = (n: number) => `$${n.toFixed(2)}`;
    const TAX_RATE = 0.06;
    const pkgKey = wash.selection.pkg as keyof typeof WashPackage;
    const base = WashPackage[pkgKey];
    const upsells = (wash.selection.upsells ?? []).filter(
        (k): k is keyof typeof UPSELLS => k in UPSELLS
    );
    const upsellLines = upsells.map((k) => ({ label: UPSELLS[k].label, amount: UPSELLS[k].price }));
    const lines = [{ label: `${pkgKey ?? ""} package`, amount: base?.price ?? 0 }, ...upsellLines];
    const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const total = subtotal + tax;

    return(
        <div className="flex flex-col">
            <div>Time slot reserved until: {IsoToHuman(wash.expireAt)}</div>

            {isStep && <ErrorBanner message={e?.form} />}
            
            <section className="mt-4 rounded border border-[#2BA2E3]/70 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h2 className="text-sm font-semibold">Booking Summary</h2>
                    <span className="rounded bg-[#2BA2E3]/10 px-2 py-0.5 text-xs font-medium text-[#2BA2E3]">
                        Review & Pay
                    </span>
                </div>

                <div className="grid gap-1 px-4 py-3 text-sm">
                    <div className="text-gray-400">
                        <span className="font-medium text-gray-500">When:</span>{" "}
                        {wash.day} {wash.time}
                    </div>
                    <div className="text-gray-400">
                        <span className="font-medium text-gray-500">Vehicle:</span>{" "}
                        {wash.selection.vehicle}
                    </div>
                </div>

                <div className="px-4 pb-2">
                    <dl className="divide-y divide-gray-200 text-sm">
                        {lines.map((l, i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                                <dt className="text-gray-200">{l.label}</dt>
                                <dd className="tabular-nums">{usd(l.amount)}</dd>
                            </div>
                        ))}
                        {upsells.length === 0 && (
                            <div className="flex items-center justify-between py-2 text-gray-200">
                                <dt>No add-ons</dt>
                                <dd>-</dd>
                            </div>
                        )}

                        <div className="flex items-center justify-between py-2">
                            <dt className="text-gray-300">Subtotal</dt>
                            <dd className="tabular-nums">{usd(subtotal)}</dd>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <dt className="text-gray-300">
                                Tax <span className="text-xs text-gray-200">(rate {TAX_RATE * 100}%)</span>
                            </dt>
                            <dd className="tabular-nums">{usd(tax)}</dd>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <dt className="text-base font-semibold">Total</dt>
                            <dd className="tabular-nums text-base font-semibold">{usd(total)}</dd>
                        </div>
                    </dl>
                </div>
            </section>

            <div className="flex items-center mt-4 justify-end gap-3">
                <button type="submit" name="_intent" value="PAYMENT" className="rounded border bg-black px-4 py-2 text-white hover:opacity-90">Book Slot</button>
            </div>
        </div>
    );
}

export function WashOptions() {
    const {wash} = useLoaderData<LoaderData>();
    const a = useActionData<{
        ok?: Boolean;
        intent?: string;
        errors?: { pkg?: string; vehicle?: string; form?: string };
    }>();
    const isStep = a?.intent === "SELECT_OPTIONS";
    const e = isStep ? a?.errors : undefined;

    if (!wash) return null;

    return(
        <div className="flex flex-col">
            <div>Time slot reserved until: {IsoToHuman(wash.expireAt)}</div>

            {isStep && <ErrorBanner message={e?.form} />}

            <div className="flex flex-col gap-3 my-5">
                <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold">Package</legend>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(WashPackage).map(([key, k]) => (
                            <div key={key} className="">
                                <input id={`pkg-${key}`} type="radio" name="package"
                                    value={key} required className="peer sr-only"
                                />
                                <label
                                    htmlFor={`pkg-${key}`}
                                    title={k.label}
                                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded border px-3 py-2 text-sm transition
                                        hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                                        peer-checked:border-black peer-checked:bg-[#2BA2E3] peer-checked:text-white"
                                >
                                    <span className="font-medium">{k.label}</span>
                                    <span className="text-gray-600">${k.price}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                    {e?.pkg && <p id="error-pkg" className="text-xs rext-red-600">{e.pkg}</p>}
                </fieldset>

                <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold">Vehicle Type</legend>
                    <div className="flex flex-wrap gap-2">
                        {(["compact", "suv", "truck"] as const).map((s) => (
                            <div key={s} className="">
                                <input id={s} type="radio" name="vehicle"
                                    value={s} required className="peer sr-only"
                                />
                                <label
                                    htmlFor={s}
                                    title={s}
                                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded border px-3 py-2 text-sm transition
                                        hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                                        peer-checked:border-black peer-checked:bg-[#2BA2E3] peer-checked:text-white"
                                >
                                    <span className="tabular-nums">{s}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                    {e?.vehicle && <p id="error-pkg" className="text-xs rext-red-600">{e.vehicle}</p>}
                </fieldset>

                <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold">Optional Add-Ons</legend>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(UPSELLS).map(([key, u]) => (
                            <div key={key}>
                                <input
                                    id={`up-${key}`}
                                    type="checkbox"
                                    name="upsells"
                                    value={key}
                                    className="peer sr-only"
                                />
                                <label
                                    htmlFor={`up-${key}`}
                                    title={u.label}
                                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded border px-3 py-2 text-sm transition
                                        hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                                        peer-checked:border-black peer-checked:bg-[#2BA2E3] peer-checked:text-white
                                ">
                                    <span>{u.label}</span>
                                    <span className="text-gray-600">${u.price}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </fieldset>

                <div className="flex items-center justify-end gap-3">
                    <button type="submit" name="_intent" value="SELECT_OPTIONS" className="rounded border bg-black px-4 py-2 text-white hover:opacity-90">Book Slot</button>
                </div>
            </div>
        </div>
    );
}

export function BookTimeSlot() {
    const tz = "America/New_York";
    const now = new Date();
    const days = Array.from({ length: 5 }).map((_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        const yyyy = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric" }).format(d);
        const mm = new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "2-digit" }).format(d);
        const dd = new Intl.DateTimeFormat("en-US", { timeZone: tz, day: "2-digit" }).format(d);
        const dateISO = `${yyyy}-${mm}-${dd}`;
        const dowShort = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(d);
        const monthShort = new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short" }).format(d);
        return { dateISO, dowShort, label: `${dowShort} ${monthShort} ${dd}` };
    });

    const slots = Array.from({ length: 12 }).map((_, i) => {
        const hour = 8 + i;
        const dt = new Date(2000, 0, 1, hour, 0, 0);
        const label = new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: tz,
        }).format(dt);
        const value = `${String(hour).padStart(2, "0")}:00`;
        return { label, value };
    });

    return(
        <div className="flex flex-col">
            <h1>Book your wash time.</h1>
            <p>Choose a time slot between 8:00AM and 7:00PM.</p>

            <div className="flex flex-col gap-3 my-5">
                <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold">Day</legend>
                    <div className="flex flex-wrap gap-2">
                        {days.map((d) => {
                            const id = `day-${d.dateISO}`;
                            const dayText = d.label.replace(`${d.dowShort} `, "");
                            return (
                                <div key={d.dateISO} className="relative">
                                    <input id={id} type="radio"
                                        name="day"
                                        value={d.dateISO}
                                        required
                                        className="peer sr-only"
                                    />
                                    <label
                                        htmlFor={id}
                                        title={d.label}
                                        className="inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm transition
                                            hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                                            peer-checked:border-black peer-checked:bg-[#2BA2E3] peer-checked:text-white"
                                    >
                                        <span className="font-medium">{d.dowShort}</span>
                                        <span className="text-gray-600">{dayText}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>

                <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold">Start time</legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {slots.map((s) => {
                            const id = `time-${s.value}`;
                            return(
                                <div key={s.value} className="relative">
                                    <input
                                        id={id}
                                        type="radio"
                                        name="time"
                                        value={s.value}
                                        required
                                        className="peer sr-only"
                                    />
                                    <label
                                        htmlFor={id}
                                        title={s.label}
                                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded border px-3 py-2 text-sm transition
                                            hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                                            peer-checked:border-black peer-checked:bg-[#2BA2E3] peer-checked:text-white
                                        ">
                                            <span className="tabular-nums">{s.label}</span>
                                        </label>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>

                <div className="flex items-center justify-end gap-3">
                    <button type="submit" name="_intent" value="BOOK_TIME" className="rounded border bg-black px-4 py-2 text-white hover:opacity-90">Book Slot</button>
                </div>
            </div>
        </div>
    );
}

export function ExpiryCountdown({ data }: { data: { doc?: any } }) {
    const expireAtMs = useMemo<number | null>(() => {
        const iso = data?.doc?.expireAt;
        if (!iso) return null;
        const t = new Date(iso).getTime();
        return Number.isFinite(t) ? t : null;
    }, [data]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!expireAtMs) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [expireAtMs]);

    if (!expireAtMs) return null;
    if (!mounted) return <span className="text-sm text-gray-500">...</span>;

    const remaining = Math.max(0, expireAtMs - now);
    if (remaining === 0) return <span className="font-medium text-red-600">Expired</span>;

    const {h, m, s} = msToParts(remaining);

    return(
        <span className="inline-flex items-center gap-2 rounded border px-2 py-1 text-sm">
            <span className="opacity-70">Expires in</span>
            <span className="tabular-nums font-semibold">
                {h > 0 ? `${pad(h)}:` : ""}
                {pad(m)}:{pad(s)}
            </span>
        </span>
    );
}

export function IsoToHuman(iso: string, {
    tz = "America/New_York",
    locale = "en-US",
    includeSeconds = false,
} : { tz?: string; locale?: string; includeSeconds?: boolean } = {}): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;

    const opts: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: tz,
        timeZoneName: "short",
    };

    if (includeSeconds) opts.second = "2-digit";

    return new Intl.DateTimeFormat(locale, opts).format(d);
}

const HOLD_TIME = 600;

type Step = 1 | 2 | 3 | 4;

export const WashPackage = {
    basic: { minutes: 20, price: 20, label: "Basic" },
    premium: { minutes: 30, price: 35, label: "Premium" },
    deluxe: { minutes: 50, price: 70, label: "Deluxe" },
} as const;

type WashPackageKey = keyof typeof WashPackage;

type Upsell = "airFreshener" | "waxBoost" | "tireShine" | "rainRepellent";

export const UPSELLS: Record<Upsell, { label: string; price: number }> = {
    airFreshener: { label: "Air Freshener", price: 3 },
    waxBoost: { label: "Wax Boost", price: 12 },
    tireShine: { label: "Tire Shine", price: 6 },
    rainRepellent: { label: "Rain Repellent", price: 10 },
}

type VehicleType = "compact" | "suv" | "truck";

type WashSelection = {
    pkg: WashPackageKey;
    vehicle: VehicleType;
    upsells: Upsell[];
    estMinutes?: number;
    estPrice?: number;
}

type WashDoc = {
    userId: string;
    day?: string;
    time?: string;
    paid?: boolean;
    createdAt: string;
    expireAt: string;
    updatedAt: string;
    selection?: WashSelection | null;
}

function pad(n: number) {
    return n.toString().padStart(2, "0");
}

function progress(step: Step) {
    return step === 1 ? 5 : step === 2 ? 66 : step === 3 ? 90 : 100;
}

function msToParts(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h, m, s };
}