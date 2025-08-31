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

            <div className="flex items-center gap-3 justify-between mt-6">
                <Link to="/blogs/handling-state-in-remix" preventScrollReset>Back To All State Methods</Link>
                <Link to="/blogs/handling-state-in-remix/url/candies" preventScrollReset>Query Params</Link>
            </div>
        </div>
    );
}