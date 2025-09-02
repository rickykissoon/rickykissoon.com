import { Link } from "@remix-run/react";


export default function Index() {

    return(
        <div className="flex flex-col gap-2">
            <Link className="w-fit" to="url/url-state" preventScrollReset>1. URL State</Link>
            <Link className="w-fit" to="loader/loader-state" preventScrollReset>2. loader{'()'}</Link>
            <Link className="w-fit" to="action/action-state" preventScrollReset>3. action{'()'}</Link>
            <Link className="w-fit" to="persistent/persistent-state" preventScrollReset>4. Persistent State</Link>
            <Link className="w-fit" to="usefetcher/usefetcher-state" preventScrollReset>5. useFetcher{'()'}</Link>
            <Link className="w-fit" to="usenavigation/usenavigation-state" preventScrollReset>6. useNavigation{'()'}</Link>
            <Link className="w-fit" to="local-ui/local-ui-state" preventScrollReset>7. Local UI State</Link>
            <Link className="w-fit" to="global/global-state" preventScrollReset>8. Global State</Link>
            <Link className="w-fit" to="defer/defer-state" preventScrollReset>9. defer{'()'}</Link>
            <Link className="w-fit" to="caching/caching-state" preventScrollReset>10. Caching</Link>
        </div>
    );
}