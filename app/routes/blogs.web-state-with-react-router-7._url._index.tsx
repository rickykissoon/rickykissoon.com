import { Link } from "react-router";

export default function Index() {

    return(
        <>
            <p>
                What was once Remix has been merged into React Router v7. Even though the mental models I learned from Remix
                are still available via React Router, it's going to be a bit difficult to accept that Remix as its own framework
                is no more.
            </p>
            <br></br>
            <p>
                But with this transition, the concepts that Remix introduced, loaders, actions, forms, and a dataflow
                rooted firmly in the web, are no longer hidden away in a niche framework. Now, as part of React Router itself,
                they have a chance to reach a much large audience.
            </p>
            <br></br>
            <p>
                Remix didn't really invent any new concepts, it just leaned heavly into the web. Loaders are GET requests,
                actions are POST requests, forms are just html forms, and cookies are just HTTP. To paraphrase Ryan Florence,
                thinking in terms of Remix (now React Router) is just thinking in terms of web fundamentals.
            </p>
            <br></br>
            <p>
                When you think of it like this, "state" in React Router naturally falls into three Layers:
            </p>
            <br></br>

            <table className="w-full text-[12px] max-w-[800px]">
                <tbody>
                    <tr>
                        <td className="pl-2 border">URL as State</td>
                        <td className="pl-2 border">params + query</td>
                    </tr>
                    <tr>
                        <td className="pl-2 border">Server as State</td>
                        <td className="pl-2 border">loaders + actions</td>
                    </tr>
                    <tr>
                        <td className="pl-2 border">Persistence as State</td>
                        <td className="pl-2 border">cookies + sessions</td>
                    </tr>
                </tbody>
            </table>
            <br></br>
            <div className="flex flex-col mt-5 gap-2">
                <Link className="w-fit" to="url-state">1. URL as State (params + query)</Link>
                <Link className="w-fit" to="server-state">2. Server as State (loaders + actions)</Link>
                <Link className="w-fit" to="persistence-state">3. Persistence as State (cookies + sessions)</Link>
            </div>
        </>
    );
}