import { Link } from "@remix-run/react";


export default function Index() {

    return(
        <div className="">
            <Link to="url/url-state" preventScrollReset>1. URL State</Link>
        </div>
    );
}