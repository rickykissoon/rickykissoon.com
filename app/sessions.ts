import { createCookieSessionStorage } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";

type SessionData = {
    userId: string;
    keyValue?: Record<string, unknown>;
};

type SessionFlashData = {
    error: string;
};

const { getSession, commitSession, destroySession } =
    createCookieSessionStorage<SessionData, SessionFlashData>(
        {
            cookie: {
                name: "__session",
                secrets: ["s3cret1"],
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
            },
        }
);

export async function getOrCreateSession(request: Request) {
    const session = await getSession(request.headers.get("Cookie"));
    let userId = session.get("userId");

    if (!userId) {
        userId = uuidv4();
        session.set("userId", userId);
    }

    return { session, userId };
}

export async function getKeyValue(request: Request) {
    const session = await getSession(request.headers.get("Cookie"));
    const keyValue = (session.get("keyValue") ?? {}) as Record<string, unknown>;

    return { session, keyValue };
}

export function setKeyValue(session: Awaited<ReturnType<typeof getSession>>, updates: Record<string, unknown>) {
    const current = (session.get("keyValue") ?? {}) as Record<string, unknown>;
    session.set("keyValue", { ...current, ...updates });
}

export { getSession, commitSession, destroySession };