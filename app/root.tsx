import {
  data,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { createHash } from "crypto";

import "./tailwind.css";
import { commitSession, getOrCreateSession, getSession } from "./sessions";
import { useTracking } from "./hooks/useTracking";
import { useState } from "react";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "icon", type: "image/x-icon", href: "/favicon.ico"
  },
  {
    rel: "shortcut icon", href: "/favicon.ico"
  }
];

export const loader: LoaderFunction = async ({ request }) => {
  const { session, userId } = await getOrCreateSession(request);
  const hashedId = createHash("sha256").update(userId).digest("hex");

  return data(
    { userId: hashedId },
    { headers: {
      "Set-Cookie": await commitSession(session)
    }}
  )
}

export type RootLoaderData = {
  userId: string;
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="">
          {children}
          <Menu />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useTracking();

  return <Outlet />;
}

export function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 text-xl items-center justify-center transition bg-[#290701] border-[#480d02] border-[1px] text-[#ff4f30] rounded-br-md"
      >{isOpen ? "x" : "☰"}</button>
    </>
  );
}