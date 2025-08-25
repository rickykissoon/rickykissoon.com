import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { commitSession, getOrCreateSession } from "~/sessions";
import { getDb } from "~/utils/db.server";


export async function loader({ request }: LoaderFunctionArgs) {
    const { session, userId } = await getOrCreateSession(request);
    const db = await getDb();
    const col = db.collection("expiring_object");

    const wash = await col.findOne({ userId, ["expireAt"]: { $gt: new Date() } });

    let step: Step = 1;
    if (wash && !wash.selection) step = 2;

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
    wash: {
        userId: string;
        day?: string;
        time?: string;
        createdAt: string;
        expireAt: string;
        updatedAt: string;
    };
};

export async function action({ request }: ActionFunctionArgs) {
    const { session, userId } = await getOrCreateSession(request);
    const form = await request.formData();

    const ttlSeconds = Number(form.get("ttl") ?? 600);
    const raw = form.get("data");
    let data: Record<string, any> = {};
    if (typeof raw === "string" && raw.trim()) {
        try {
            data = JSON.parse(raw);
        } catch {
            return Response.json({ error: "Invalid JSON in data "}, { status: 400 });
        }
    }

    const day = form.get("day")?.toString();
    const time = form.get("time")?.toString();

    const now = new Date();
    const expireAt = new Date(now.getTime() + ttlSeconds * 1000);

    const db = await getDb();
    const col = db.collection("expiring_object");

    const res = await col.findOneAndUpdate(
        { userId },
        {
            $set: { ...data, day, time, userId, ["expireAt"]: expireAt, updatedAt: now },
            $setOnInsert: { createdAt: now },
        },
        { upsert: true, returnDocument: "after" }
    );

    const headers = new Headers({
        "Set-Cookie": await commitSession(session),
    });

    return Response.json({
        ok: true,
        doc: res?.value,
        expireAt: expireAt,
        ttlSeconds,
    }, {
        headers,
        status: res?.lastErrorObject?.upserted ? 201 : 200
    });
}


export default function ActionState() {
    const data = useLoaderData<LoaderData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    useEffect(() => {
        console.log(data);
    }, [data]);

    return(
        <div className="">
            <p>
                Actions allow you to perform mutations, after the action runs, the loader is revalidated,
                and the UI is updated to reflect the updates without having to manage state manually.
            </p>
            <br></br>
            <p>
                Lets walk through this process below, starting with the loader:
            </p>
            <br></br>
            <p>
                When the user lands on the page, the loader runs. In this case we are going to query the
                database for 
            </p>
            <br></br>
            <LoaderSnippet />
            <br></br>
            <p>
                Our component renders it, and also provides a form where the user can update it via an action.
            </p>
            <br></br>
            <ComponentSnippet />
            <br></br>
            <p>
                Heres the action that will capture the POST request and perform the mutation on our database.
            </p>
            <br></br>
            <ActionSnippet />
            <br></br>
            <p>
                Once the action finishes, it causes the loader to revalidate and our UI will update with the
                latest data. No need for useState, its a perfect loop. Below is the actual implementation that
                you can play around with to see it in action.
            </p>

            {/* {data && (
                <ExpiryCountdown data={data} />
            )} */}

            <div className="mt-10">
                <h1>Car Wash Booking</h1>
            </div>

            {data && (
                <div className="mt-5">Step: {data.step}</div>
            )}

            <div className="border border-[#2BA2E3] h-[35px]" style={{ borderRadius: 2, overflow: "hidden", margin: "8px 0 16px" }}>
                <div style={{ width: `${progress(data.step)}%`, height: "100%", background: data.step < 4 ? "#2BA2E3" : "#16a34a" }} />
            </div>

            <Form method="POST" className="mt-3 space-y-3">
                {data.step === 1 && (
                    <Calendar />
                )}

                {data.step === 2 && (
                    <>
                        <div>Time slot reserved until: {IsoToHuman(data.wash.expireAt)}</div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium">TTL (seconds)</label>
                    <input
                        name="ttl"
                        type="number"
                        min={1}
                        defaultValue={600}
                        className="mt-1 w-full rounded border px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">
                        Date (JSON object, optional)
                    </label>
                    <textarea
                        name="data"
                        rows={6}
                        placeholder='{"note": "hello", "cartId": "abc123"}'
                        className="mt-1 w-full rounded border px-3 py-2 font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Leave empty to only bump the expiration
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded bg-black border px-4 py-2 text-white disabled:opacity-60"
                >{isSubmitting ? "Saving..." : "Save / Refresh" }</button>
            </Form>
            
            <div className="flex items-center gap-3 justify-between mt-6">
                <Link to="/blogs/handling-state-in-remix" preventScrollReset>Back To All State Methods</Link>
                <Link to="/blogs/handling-state-in-remix/action/action-state" preventScrollReset>3. action{'()'}</Link>
            </div>
        </div>
    );
}

export function Calendar() {
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

    const slots = Array.from({ length: 8 }).map((_, i) => {
        const hour = 9 + i;
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
            <p>Choose a time slot between 9:00AM and 5:00PM.</p>

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
                    <button type="submit" className="rounded border bg-black px-4 py-2 text-white hover:opacity-90">Book Slot</button>
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

function LoaderSnippet() {
    return(
        <pre><code>
{`export const loader: LoaderFunction = async ({ params }) => {

};`}    
        </code></pre>
    );
}

function ComponentSnippet() {
    return(
        <pre><code>
{`export default function PageComponent {
    const {} = useLoaderData<MyType>();

    return(
        <>
            <div>contains the UI</div>

            <Form action="POST">

            </Form>
        </>
    )
};`}    
        </code></pre>
    );
}


function ActionSnippet() {
    return(
        <pre><code>
{`export const action: actionFunction = async ({ params }) => {

};`}    
        </code></pre>
    );
}

type Step = 1 | 2 | 3 | 4;

function pad(n: number) {
    return n.toString().padStart(2, "0");
}

function progress(step: Step) {
    return step === 1 ? 33 : step === 2 ? 66 : step === 3 ? 90 : 100;
}

function msToParts(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h, m, s };
}