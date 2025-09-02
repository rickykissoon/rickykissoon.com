import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { commitSession, getKeyValue, setKeyValue } from "~/sessions";

export async function loader({ request }: LoaderFunctionArgs) {
    const {keyValue} = await getKeyValue(request);
    const prefs = getPrefsFromKeyValue(keyValue);

    const movies = MOVIES.map((m) => ({
        id: m.id,
        title: m.title,
        year: m.year,
        likes: m.likes + (prefs.reactions[m.id] === "like" ? 1 : 0),
        reaction: prefs.reactions[m.id] ?? null as null | "like",
        starred: prefs.stars.includes(m.id),
    }));

    return Response.json({ movies });
}

export interface LoaderData {
    movies: Movie[];
}

export async function action({ request }: ActionFunctionArgs) {
    const {session, keyValue} = await getKeyValue(request);
    const prefs = getPrefsFromKeyValue(keyValue);

    const fd = await request.formData();
    const intent = String(fd.get("intent") ?? "");
    const movieId = String(fd.get("movieId") ?? "");

    if (!MOVIES.find((m) => m.id === movieId)) {
        return Response.json({error: "Movie not found"}, {status: 404});
    }

    if (intent === "toggleStar") {
        const i = prefs.stars.indexOf(movieId);
        if (i >= 0) prefs.stars.splice(i, 1);
        else prefs.stars.push(movieId);
    } else if (intent === "toggleLike") {
        if (prefs.reactions[movieId] === "like") {
            delete prefs.reactions[movieId];
        } else {
            prefs.reactions[movieId] = "like";
        }
    } else {
        return Response.json({error: "Unknown intent"}, {status: 400});
    }

    setKeyValue(session, {moviePrefs: prefs});

    const updated = MOVIES.find((m) => m.id === movieId)!;
    const likes = updated.likes + (prefs.reactions[movieId] === "like" ? 1 : 0);

    return Response.json({
        movie: {
            id: updated.id,
            title: updated.title,
            likes,
            reaction: prefs.reactions[movieId] ?? null,
            starred: prefs.stars.includes(movieId),
        },
    },{
        headers: {"Set-Cookie": await commitSession(session)}
    });
}

export default function UseFetcherState() {
    const { movies } = useLoaderData<LoaderData>();

    return(
        <div>
            <p>
                useFetcher() is a hook used for interacting with loaders and actions without navigating, causing URL
                changes or affecting history. It can be used like {'<Form>'}:
            </p>
            <br></br>
            <FetcherFormSnippet />
            <br></br>
            <p>
                Or it can be used directly, like when interacting with Loaders:
            </p>
            <br></br>
            <LoaderSnippet />
            <br></br>
            <p>
                The biggest benefits of using useFetcher() is when you want to read/write data without causing URL
                changes or navigation when working with small interactions that shouldn't be bookmarkable or shareable, 
                cause full-page revalidations, or if you need to make multiple isolated requests on one page.
            </p>

            <div className="mt-10">
                <h1 className="text-[25px] font-bold mb-3 text-center">Movies</h1>

                <div className="flex flex-wrap gap-2">
                    {movies.map((m) => (
                        <MovieCard key={m.id} initial={m} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function MovieCard({initial}: {initial: Movie}) {
    const fetcher = useFetcher<typeof action>();
    const current = fetcher.data?.movie ?? initial;

    const pendingIntent = fetcher.state === "submitting" ? String(fetcher.formData?.get("intent")) : null;

    let likes = current.likes;
    let reaction = current.reaction;
    let starred = current.starred;

    if (pendingIntent === "toggleStar") {
        starred = !current.starred;
    } else if (pendingIntent === "toggleLike") {
        if (reaction === "like") {
            likes -= 1;
            reaction = null;
        } else {
            likes += 1;
            reaction = "like";
        }
    }

    return(
        <div className="flex flex-col border rounded p-3 w-[200px]">
            <div className="bg-gray-950 rounded w-full h-[100px]"></div>
            <div className="flex flex-row justify-between mt-2">
                <div>
                    <svg onClick={() => fetcher.submit({intent: "toggleStar", movieId: initial.id}, {method: "post"})} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ fill: starred && "yellow" }} className="stroke-yellow-400 size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                </div>
                <div className="flex">
                    {likes}
                    <fetcher.Form method="post">
                        <input type="hidden" name="intent" value="toggleLike" />
                        <input type="hidden" name="movieId" value={initial.id} />

                        <button
                            type="submit"
                            title={reaction === "like" ? "Unlike" : "Like"}
                            className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                reaction === "like" ? "text-blue-600 focus:ring-blue-500" : "text-gray-600 focus:ring-gray-400"
                              }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill={reaction === "like" ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                            </svg>
                        </button>
                    </fetcher.Form>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="text-gray-600">{initial.year}</div>
            </div>
            <div className="font-bold text-center">{initial.title}</div>
        </div>
    );
}

function FetcherFormSnippet() {
    return(
        <pre><code>
{`function PageComponent() {
    const fetcher = useFetcher();
    const isSubmitting = fetcher.state === "submitting";

    return(
        <fetcher.Form method="post" action="/user-profile">
            <h1>Profile</h1>

            <div>
                <label>
                    Full name
                    <input type="text" name="name" required />
                </label>

                <label>
                    Date of birth
                    <input type="date" name="dob" required />
                </label>

                <label>
                    Country
                    <select name="country" required defaultValue="">
                        <option value="" disabled>Choose...</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="JP">Japan</option>
                    </select>
                </label>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                </button>
            </div>
        </fetcher.Form>
    );
}`}    
        </code></pre>
    );
}

function LoaderSnippet() {
    return(
        <pre><code>
{`export default function Dashboard() {
    const salesFetcher = useFetcher();

    const isLoading = salesFetcher.state === "loading";
    const sales = salesFetcher.data;

    return(
        <div>
            <h1>Sales Widget</h1>

            <div>
                <button onClick={() => salesFetcher.load("/api/sales?range=7d")} disabled={isLoading}>
                    {isLoading ? "Loading..." : "Last 7 days"}
                </button>
                <button onClick={() => salesFetcher.load("/api/sales?range=30d")} disabled={isLoading}>
                    {isLoading ? "Loading..." : "Last 30 days"}
                </button>
            </div>

            {sales && sales.map((sale, index) => (
                <SaleComponent key={index} data={sale} />
            ))}
        </div>
    );
}`}    
        </code></pre>
    );
}

function getPrefsFromKeyValue(keyValue: Record<string, unknown>): Prefs {
    const prefs = keyValue.moviePrefs as Prefs | undefined;
    return prefs ?? { stars: [], reactions: {} };
}

type Prefs = {
    stars: string[];
    reactions: Record<string, "like" | "dislike">;
};

type Movie = {
    id: string;
    title: string;
    year: string;
    likes: number;
    reaction?: "like" | null;
    starred?: boolean;
}

const MOVIES: Movie[] = [
    {
        id: 'jurassic-park-1993',
        title: 'Jurassic Park',
        year: '1993',
        likes: 10,
    },
    {
        id: 'interstellar-2014',
        title: 'Interstellar',
        year: '2014',
        likes: 20,
    },
    {
        id: 'inception-2010',
        title: 'Inception',
        year: '2010',
        likes: 30,
    },
    {
        id: 'the-man-from-earth-2007',
        title: 'The Man From Earth',
        year: '2007',
        likes: 3,
    },
    {
        id: 'rise-of-the-planet-of-the-apes-2011',
        title: 'Rise Of The Planet Of The Apes',
        year: '2011',
        likes: 35,
    },
    {
        id: 'alien',
        title: 'Alien',
        year: '1979',
        likes: 40,
    },
    {
        id: 'blade-runner-2049-2017',
        title: 'Blade Runner 2049',
        year: '2017',
        likes: 50,
    },
    {
        id: 'annihilation-2018',
        title: 'Annihilation',
        year: '2018',
        likes: 25,
    },
    {
        id: 'contact-1997',
        title: 'Contact',
        year: '1997',
        likes: 15,
    },
    {
        id: 'gattaca-1997',
        title: 'Gattaca',
        year: '1997',
        likes: 45,
    },
]