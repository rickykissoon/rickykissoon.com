import { Link, Outlet } from "react-router";
import { Info } from "~/components/Post";

export default function ServerState() {

    return(
        <div>
            <div>
                <h1 className="text-[25px] font-bold mb-5 text-center">Server As State</h1>
            </div>
            <p>
                Server state can be thought of as data that originates from the server (loaders and actions) and is managed automatically
                by the router via navigation, URL changes, and form submissions.
            </p>
            <br></br>
            <p>
                Loaders provide initial data to a routes components, and keep that data up to date through revalidation. Actions are
                triggered by POST, PUT, PATH, or DELETE to mutate data. Once the action completes, it automatically triggers a loader
                revalidation, which means the route's component will update with the new updated data. We can trigger actions with form
                submissions (with {'<Form>'}) or programmatically with useFetcher(), which allows you to hit actions and loaders without
                causing a navigation.
            </p>
            <br></br>
                <Info title="React Router Navigation"
                    body={
                        <>
                            <p>
                                In React Router, {'<Form>'} behaves like a navigation, but it only happens client side.
                            </p>
                            <br></br>
                            <p>
                                Submitting a {'<Form>'} triggers the the target route's action, once the action finishes, React Router
                                performs the client side navigation and loader revalidation. If the {'<Form>'} points to the same route
                                the navigation stays on the current page, but if the form points to a different route, React Router will
                                navigate there.
                            </p>
                        </>
                    }
                />
            <br></br>
            <p>
                Let's see how loaders, actions, and {'<Form>'} can work in sync with an example project, a car wash booking system.
                For the user there will be 4 steps:
            </p>
            <br></br>
            <p className="ml-6">
                1. Scheduling a day and time.
            </p>
            <p className="ml-6">
                2. Options selections (package type, vehicle type, upsells).
            </p>
            <p className="ml-6">
                3. A receipt view and a book now button to simulate a purchase.
            </p>
            <p className="ml-6">
                4. Confirmation.
            </p>
            <br></br>
            <p>
                Each step is broken up into different {'<Form>'} submissions and loader revalidations. Each submission mutates the
                database and the revalidation step will change the data the component renders based on what the loader returns.
            </p>
            <br></br>
            <p>
                The loader will determine which step the user is on at any point in the process:
            </p>
            <br></br>
            <LoaderSnippet />
            <br></br>
            <p>
                Based on the step that the loader returns to our component, we will render the correlated form:
            </p>
            <br></br>
            <ComponentSnippet />
            <br></br>
            <p>
                Here's a simplified view of one of the forms:
            </p>
            <br></br>
            <BookTimeSlotSnippet />
            <br></br>
            <p>
                On form submission the action determines the users current step based on the intent set on the form button. Then it
                progresses the user along the booking lifecycle by mutating the car_wash_booking object. The action can also return 
                data that we use as form validation.
            </p>
            <br></br>
            <ActionSnippet />
            <br></br>
            <p>
                Once the action finishes, the loader gets revalidated and the UI updates with the latest data. No need for useState(),
                its a perfect loop. Below is the working widget that you can play around with to see loaders, forms, and actions working
                together.
            </p>

            <Outlet />

            <div className="flex items-center gap-3 justify-between mt-6">
                <Link to="/blogs/web-state-with-react-router-7" preventScrollReset>Home</Link>
                <Link to="/blogs/web-state-with-react-router-7/server-state-usefetcher" preventScrollReset>2b.Server as State (useFetcher())</Link>
            </div>
        </div>
    )
}

function LoaderSnippet() {
    return(
        <pre><code>
{`export async function loader({ request }: LoaderFunctionArgs) {
    const { userId } = await getSession(request);
    const db = await getDb();
    const col = db.collection("car_wash_bookings");
    const wash = await col.findOne({ userId, ["expireAt"]: { $gt: new Date() } });

    let step = 1;
    if (wash && wash.day) step = 2;
    if (wash && wash.selection) step = 3;
    if (wash && wash.paid) step = 4;

    return Response.json({
        step,
        wash,
    });
};`}    
        </code></pre>
    );
}

function ComponentSnippet() {
    return(
        <pre><code>
{`export default function PageComponent {
    const {step} = useLoaderData<MyType>();

    return(
        <>
            <h1 className="mt-10">Car Wash Booking</h1>

            <div className="border border-[#2BA2E3] h-[35px]" style={{ borderRadius: 2, overflow: "hidden", margin: "8px 0 16px" }}>
                <div style={{ width: progress(data.step), height: "100%", background: data.step < 4 ? "#2BA2E3" : "#16a34a" }} />
            </div>

            {step === 4 ? (
                <div>Booked & Paid</div>
            ) : (
                <Form method="POST">
                    {data.step === 1 && (
                        <BookTimeSlot />
                    )}

                    {data.step === 2 && (
                        <WashOptions />
                    )}

                    {data.step === 3 && (
                        <ConfirmPayment />
                    )}
                </Form>
            )}
        </>
    );
};`}    
        </code></pre>
    );
}

function BookTimeSlotSnippet() {
    return(
        <pre><code>
{`export function BookTimeSlot() {
    const days = getDays();
    const timeSlots = getTimeSlots();

    return(
        <div className="flex flex-col">
            <h1>Book your wash time.</div>
            <p>Choose a time slot between 8AM and 7PM.</p>

            <fieldset>
                <legend>Day</legend>
                <div>
                    {days.map((d) => (
                        <div key={d.id}>
                            <input id={d.id}
                                type="radio"
                                name="day"
                                value={d.dateISO}
                                required
                                className="peer sr-only"
                            />
                            <label
                                htmlFor={id}
                                title={d.label}
                                className="peer-checked:border-black peer-checked:bg-[#2BA2E3]"
                            >
                                <span>{d.dayName}</span>
                                <span>{d.label}</span>
                            </label>
                        </div>
                    ))}
                </div>
            </fieldset>
            <fieldset>
                <legend>Start time</legend>
                <div>
                    {timeSlots.map((t) => (
                        <div key={t.id}>
                            <input id={t.id}
                                type="radio"
                                name="time"
                                value={t.value}
                                required
                                className="peer sr-only"
                            />
                            <label
                                htmlFor={t.id}
                                title={t.label}
                                className="peer-checked:border-black peer-checked:bg-[#2BA2E3]"
                            >
                                <span>{t.label}</span>
                            </label>
                        </div>
                    ))}
                </div>
            </fieldset>

            <div>
                <button
                    type="submit"
                    name="_intent"
                    value="BOOK_TIME"
                >
                    Book Slot
                </button>
            </div>
        </div>
    );
};`}    
        </code></pre>
    )
}

function ActionSnippet() {
    return(
        <pre><code>
{`export async function action({ request }: ActionFunctionArgs) {
    const { userId } = await getSession(request);
    const form = await request.formData();
    const intent = String(form.get("_intent") || "");

    const db = await getDb();
    const col = db.collection("car_wash_booking");
    const now = new Date();

    if (intent === "BOOK_TIME") {
        const day = form.get("day")?.toString();
        const time = form.get("time")?.toString();

        if (!day || !time) {
            return Response.json({ error: "Pick a day and time" }, { status: 400 });
        }

        const expireAt = new Date(now.getTime() + HOLD_TIME);
        const res = await col.findOneAndUpdate(
            { userId },
            {
                $set: { userId, day, time, expireAt, updatedAt: now },
                $setOnInsert: { createdAt: now },
            },
            { upsert: true, returnDocument: "after" }
        );

        return Response.json(
            { ok: true, step: 2, doc: res, expireAt }
        );
    }

    if (intent === "SELECT_OPTIONS") {
        .
        .
        .
    }
    
    ....
};`}    
        </code></pre>
    );
}
