import { ActionFunctionArgs, data } from "@remix-run/node";
import { getOrCreateSession } from "~/sessions";
import { getDb } from "~/utils/db.server";


export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== 'POST') {
        return data({
            error: "Method Not Allowed"
        }, {
            status: 405
        });
    }

    const db = await getDb();
    const collection = db.collection("tracking_events");

  const { userId } = await getOrCreateSession(request);

    try {
        const body = await request.json();

        if (!userId || !body.eventType || !body.timestamp) {
            return data({
                error: "Missing required fields"
            }, {
                status: 400
            });
        }

        await collection.insertOne({
            userId,
            eventType: body.eventType,
            eventData: body.data || {},
            timestamp: new Date(body.timestamp),
        });

        return { success: true };
    } catch (error) {
        console.error("Tracking error", error);
        return data({
            error: "Internal Server Error"
        }, {
            status: 500
        });
    }
}