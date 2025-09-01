import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { commitSession, getKeyValue, getOrCreateSession, getSession, setKeyValue } from "~/sessions";

type Level = "child" | "adult" | "expert";

export async function loader({ request }: LoaderFunctionArgs) {
    const { session, keyValue } = await getKeyValue(request);
    const level = (keyValue["read:level"] as Level | undefined) ?? "adult";

    return Response.json({
        level
    },
    {
        headers: { "Set-Cookie": await commitSession(session) }
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const fd = await request.formData();
    const key = String(fd.get("key"));
    const value = String(fd.get("value")) ?? "adult";

    setKeyValue(session, { [key]: value });

    return new Response(null, {
        status: 204,
        headers: { "Set-Cookie": await commitSession(session)}
    });
}

export default function PersistentState() {
    const { level } = useLoaderData<typeof loader>();

    return(
        <div>
            <p>
                We can also persist state using cookies and localhost. Localhost works the same as it would in react or a
                vanilla js app, so we will instead focus on using cookies. Remix has its own handler for creating and reading cookies,
                createCookieSessionStorage(). We can implement it like the following:
            </p>
            <br></br>
            <CreateCookieSnippet />
            <br></br>
            <p>
                And we can create a simple handler to store and read the cookies:
            </p>
            <br></br>
            <CookieHandlerSnippet />
            <br></br>
            <p>
                Now we can set and read our cookie via the loader and action, and then pass data down to our component via
                useLoaderData() as we have done before.
            </p>
            <br></br>
            <LoaderSnippet />
            <br></br>
            <ActionSnippet />
            <br></br>
            <ComponentSnippet />
            <br></br>
            <p>
                And here's our working example, which shows 3 topics in three different reading levels.
            </p>
            <br></br>

            <div>
                <h1 className="text-2xl mb-2 font-bold">Reading Level</h1>

                <p>Select your preferred reading level.</p>
                <Form method="post" className="mt-3 mb-6 flex items-center gap-3">
                    <input type="hidden" name="key" value="read:level" />
                    <label htmlFor="lvl" className="text-sm text-gray-700">Reading level:</label>
                    
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <button
                            type="submit"
                            name="value"
                            value="child"
                            aria-pressed={level === "child"}
                            aria-current={level === "child" ? "true" : undefined}
                            className={`w-full rounded border px-4 py-3 text-left transition
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                                ${level === "child"
                                    ? "border-black bg-[#2BA2E3] text-white"
                                    : "border-gray-300 hover:bg-gray-50"}`}
                        >
                            <div className="flex items-center gap-2">
                                <div>
                                    <div className="font-medium">Child</div>
                                    <div className="text-xs text-gray-600">
                                        Simple words & short sentences
                                    </div>
                                </div>
                            </div>
                        </button>

                        <button
                            type="submit"
                            name="value"
                            value="adult"
                            aria-pressed={level === "adult"}
                            aria-current={level === "adult" ? "true" : undefined}
                            className={`w-full rounded border px-4 py-3 text-left transition
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                                ${level === "adult"
                                    ? "border-black bg-[#2BA2E3] text-white"
                                    : "border-gray-300 hover:bg-gray-50"}`}
                        >
                            <div className="flex items-center gap-2">
                                <div>
                                    <div className="font-medium">Adult</div>
                                    <div className="text-xs text-gray-600">
                                        Standard prose with key terms
                                    </div>
                                </div>
                            </div>
                        </button>

                        <button
                            type="submit"
                            name="value"
                            value="expert"
                            aria-pressed={level === "expert"}
                            aria-current={level === "expert" ? "true" : undefined}
                            className={`w-full rounded border px-4 py-3 text-left transition
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                                ${level === "expert"
                                    ? "border-black bg-[#2BA2E3] text-white"
                                    : "border-gray-300 hover:bg-gray-50"}`}
                        >
                            <div className="flex items-center gap-2">
                                <div>
                                    <div className="font-medium">Expert</div>
                                    <div className="text-xs text-gray-600">
                                        Technical terms & precise phrasing
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                </Form>

                <Section {...physics(level)} />
                <Section {...biology(level)} />
                <Section {...history(level)} />
            </div>

            <div className="flex items-center gap-3 justify-between mt-6">
                <Link to="/blogs/handling-state-in-remix" preventScrollReset>Back To All State Methods</Link>
                <Link to="/blogs/handling-state-in-remix/persistent/persistent-state" preventScrollReset>4. Persistent State</Link>
            </div>
        </div>
    );
}

function CreateCookieSnippet() {
    return(
        <pre><code>
{`const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: "__session",
        secrets: process.env.SECRET,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    },
});`}    
        </code></pre>
    );
}

function CookieHandlerSnippet() {
    return(
        <pre><code>
{`export async function getKeyValue(request: Request) {
    const session = await getSession(request.headers.get("Cookie"));
    const keyValue = (session.get("keyValue") ?? {}) as Record<string, unknown>;

    return { session, keyValue };
}

export function setKeyValue(session: Awaited<ReturnType<typeof getSession>>, updates: Record<string, unknown>) {
    const current = (session.get("keyValue") ?? {}) as Record<string, unknown>;
    session.set("keyValue", { ...current, ...updates });
}`}
        </code></pre>
    );
}

function LoaderSnippet() {
    return(
        <pre><code>
{`type Level = "child" | "adult" | "expert";

export async function loader({ request }: LoaderFunctionArgs) {
    const {session, keyValue} = await getKeyValue(request);
    const level = (keyValue["read:value"] as Level | undefined) ?? "adult";

    return Response.json({ level }, {
        headers: { "Set-Cookie": await commitSession(session) }
    });
}`}    
        </code></pre>
    );
}

function ActionSnippet() {
    return(
        <pre><code>
{`export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const fd = await request.formData();
    const key = String(fd.get("key"));
    const value = String(fd.get("value")) ?? "adult";

    setKeyValue(session, { [key]: value });

    return new Response(null, {
        status: 204,
        headers: { "Set-Cookie": await commitSession(session)}
    });
}`}    
        </code></pre>
    );
}

function ComponentSnippet() {
    return(
        <pre><code>
{`export default ReadingLevels() {
    const {level} = useLoaderData<typeof loader>();

    return(
        <div>
            <h1>Reading Level</h1>
            <p>Select your preferred reading level.</p>

            <Form method="post">
                <input type="hidden" name="key" value="read:level" />

            </Form>
        </div>
    );
}`}    
        </code></pre>
    );
}

type Article = { title: string; deck?: string; body: string[] };

function Section(a: Article) {
  return (
    <article className="mb-6 rounded border p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{a.title}</h2>
      {a.deck && <p className="mt-1 mb-3 text-gray-700">{a.deck}</p>}
      <div className="space-y-3">
        {a.body.map((p, i) => (
          <p key={i} className="leading-relaxed">{p}</p>
        ))}
      </div>
    </article>
  );
}

function physics(level: Level): Article {
    if (level === "child") {
      return {
        title: "Physics: Rollercoaster Energy",
        deck: "Energy changes shape but doesn’t disappear.",
        body: [
          "At the top of a hill the coaster has stored energy. As it zooms down, that energy turns into moving energy.",
          "Some energy rubs away as heat and sound—like warm hands when you rub them."
        ],
      };
    }
    if (level === "adult") {
      return {
        title: "Physics: Conservation of Energy",
        deck: "Height trades for speed; total mechanical energy is ~constant.",
        body: [
          "Ignoring losses, m·g·h + ½·m·v² stays constant along the track.",
          "Rolling resistance and drag convert some mechanical energy into heat/sound, requiring external work to start or maintain motion."
        ],
      };
    }
    // expert
    return {
      title: "Physics: Energy Bookkeeping on a Track",
      deck: "With nonconservative forces, E_mech decreases while E_total is conserved.",
      body: [
        "For a point mass: E_mech = m·g·h + ½·m·v². When W_nc ≠ 0, ΔE_mech = W_nc and ΔE_thermal = −W_nc.",
        "Observed peak decay is modeled with drag ~αv or βv² depending on Reynolds regime."
      ],
    };
  }
  
  function biology(level: Level): Article {
    if (level === "child") {
      return {
        title: "Biology: How Plants Make Food",
        deck: "Leaves use sunlight to cook sugar.",
        body: [
          "Plants take in air and water, then sunlight helps them make sugar for food.",
          "While they work, they puff out oxygen—the stuff we breathe!"
        ],
      };
    }
    if (level === "adult") {
      return {
        title: "Biology: Photosynthesis",
        deck: "Light reactions power carbon fixation in chloroplasts.",
        body: [
          "Photons drive electron transport to generate ATP and NADPH; water splitting releases O₂.",
          "The Calvin cycle fixes CO₂ via Rubisco, producing carbohydrates from triose phosphates."
        ],
      };
    }
    // expert
    return {
      title: "Biology: Z-Scheme & Calvin–Benson Cycle",
      deck: "PSII→PSI electron flow, NPQ control, and Rubisco-limited assimilation.",
      body: [
        "PSII oxidizes H₂O (OEC), establishing Δp for ATP synthase; PSI reduces NADP⁺ to NADPH.",
        "CO₂ fixation into RuBP yields 3-PGA; assimilation toggles between Rubisco kinetics and RuBP regeneration constraints."
      ],
    };
  }
  
  function history(level: Level): Article {
    if (level === "child") {
      return {
        title: "History: The French Revolution",
        deck: "People wanted fair rules and better lives.",
        body: [
          "Many were hungry and paid lots of taxes. They stood up together and took the Bastille.",
          "New rules said people should be treated fairly."
        ],
      };
    }
    if (level === "adult") {
      return {
        title: "History: France 1789–1799",
        deck: "Fiscal crisis sparked reform; ideals met turmoil and war.",
        body: [
          "Insolvency and grain shortages catalyzed 1789 and the Declaration of the Rights of Man.",
          "Radicalization led to the Terror, then stabilization and Napoleon’s rise."
        ],
      };
    }
    // expert
    return {
      title: "History: From Estates to Empire",
      deck: "Sovereignty shift, path-dependent radicalization, and institutional reconfiguration.",
      body: [
        "The Third Estate’s claim reframed legitimacy; popular mobilization constrained elites and accelerated reform.",
        "War and counter-revolution stressed fragile institutions, producing the Terror and enabling Bonaparte’s consolidation."
      ],
    };
  }