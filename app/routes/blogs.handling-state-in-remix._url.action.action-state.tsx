import { Link } from "@remix-run/react";

export default function ActionState() {

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

            
            <div className="flex items-center gap-3 justify-between mt-6">
                <Link to="/blogs/handling-state-in-remix" preventScrollReset>Back To All State Methods</Link>
                <Link to="/blogs/handling-state-in-remix/action/action-state" preventScrollReset>3. action{'()'}</Link>
            </div>
        </div>
    );
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