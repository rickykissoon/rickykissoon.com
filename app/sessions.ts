import { createCookieSessionStorage } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";

type SessionData = {
    userId: string;
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

export { getSession, commitSession, destroySession };