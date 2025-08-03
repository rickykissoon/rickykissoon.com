import { useEffect, useState } from "react";

export function ClientOnly({
    children,
    fallback = null,
}: {
    children: React.ReactNode | (() => React.ReactNode);
    fallback?: React.ReactNode;
}) {
    const [ready, setReady] = useState(false);

    useEffect(() => setReady(true), []);

    if (!ready) return <>{fallback}</>;

    return <>{typeof children === "function" ? (children as any)() : children}</>;
}