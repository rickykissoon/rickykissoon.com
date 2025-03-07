import { useLocation } from "@remix-run/react";
import { useEffect } from "react";


type EventData = Record<string, string | number | boolean>;

export async function trackEvent(eventType: string, data: EventData = {}): Promise<void> {
    await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            eventType,
            data,
            timestamp: new Date().toISOString(),
        }),
    })
    .then(res => res.json())
    .then(data => console.log('API response:', data))
    .catch(err => console.error("Error:", err));
}

export function useTracking() {
    const location = useLocation();

    useEffect(() => {
        console.log('useTracking useeffect');
        trackEvent("page_view", { url: location.pathname });

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.dataset.track) {
                trackEvent("click", { element: target.dataset.track });
            }
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, [location]);
}