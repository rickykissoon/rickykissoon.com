import { Link } from "@remix-run/react";


export default function SecondPage() {

    return(
        <div>
            <Link  data-track="navigate" to="/">GO Home</Link>
        </div>
    )
}