import { ActionFunctionArgs } from "react-router";
import { getOrCreateSession } from "~/sessions";
import { getDb } from "~/utils/db.server";


export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== 'POST') {
        return Response.json({
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
            return Response.json({
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

        return Response.json({ success: true });
    } catch (error) {
        console.error("Tracking error", error);
        return Response.json({
            error: "Internal Server Error"
        }, {
            status: 500
        });
    }
}