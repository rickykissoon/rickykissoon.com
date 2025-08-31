import { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { commitSession, getOrCreateSession } from "~/sessions";

export async function loader({ request }: LoaderFunctionArgs) {
    const {session, userId} = await getOrCreateSession(request);

    return Response.json({

    },
    {
        headers: { "Set-Cookie": await commitSession(session) }
    });
}

export default function PersistentState() {

    return(
        <div>
            <p>
                Persistent state can use cookies or localhost. Localhost only persist on the client side, but cookies work
                on both the client and the server.
            </p>

            <div className="flex items-center gap-3 justify-between mt-6">
                <Link to="/blogs/handling-state-in-remix" preventScrollReset>Back To All State Methods</Link>
                <Link to="/blogs/handling-state-in-remix/persistent/persistent-state" preventScrollReset>4. Persistent State</Link>
            </div>
        </div>
    )
}