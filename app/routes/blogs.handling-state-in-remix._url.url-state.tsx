import { Link } from "@remix-run/react";


export default function URLInState() {

    return(
        <div className="">
            <p>
                State can be stored and accessed in the URL via the path or query params.
            </p>
            <br></br>
            <p>
                Using <span className="text-teal-500">{'<Outlet />'}</span> this html section is being rendered from a subroute.
                And because its just a path, you can use the browsers back button, or another link to go back, no need to wire up
                some complicated state system to give the user that feature.
            </p>
            <br></br>
            <p>
                Changing paths appear to be full page loads, but due to the way remix handles loading content its not exactly. Remix
                can determine what content changes, in this case, only the content in the <span className="text-teal-500">{'<Outlet />'}</span>.
                Only this content gets updated, the rest of the page, including the header and the footer does&apos;nt get rehydrated.
            </p>
            <br></br>
            <Link to="/blogs/handling-state-in-remix/candies" preventScrollReset>Query Params</Link>
        </div>
    );
}