import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { createHash } from "crypto";

import "./tailwind.css";
import { commitSession, getOrCreateSession } from "./sessions";
import { useTracking } from "./hooks/useTracking";
import Menu from "./components/Menu";
import { Post } from "./components/Post";

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
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  useTracking(location.pathname);

  return (
    <>
      <Outlet />
      <Menu />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const quotes = [
    {
      text: "No great discovery was ever made without a bold guess.",
      author: "Isaac Newton",
    },
    {
      text: "Somewhere, something incredible is waiting to be known.",
      author: "Carl Sagan"
    },
    {
      text: "The most exciting phrase to hear in science, the one that heralds new discoveries, is not 'Eureka!' but 'That's funny...'",
      author: "Isaac Asimov"
    },
    {
      text: "To understand is to perceive patterns.",
      author: "Isaiah Berlin"
    },
    {
      text: "The best way to predict the future is to invent it.",
      author: "Alan Kay"
    },
    {
      text: "In the fields of observation, chance favors only the prepared mind.",
      author: "Lous Pasteur"
    },
    {
      text: "Not all those who wander are lost.",
      author: "J.R.R. Tolkien"
    },
    {
      text: "The unknown is not empty. It is full of possibilities.",
      author: "Star Trek: The Next Generation"
    }
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return(
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex w-full">
			    <div className="m-3 lg:mx-10 w-full">
            <div className="mt-7 max-w-[700px]">
              <Post
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008Z" />
                  </svg>
                } 
                title={<div>
                  {isRouteErrorResponse(error)
                  ? `${error.status} ${error.statusText}`
                  : error instanceof Error
                  ? error.message
                  : "Unknown Error"
                  }</div>
                } 
                body={
                  <div>
                    <div className="text-[#6e5e5d]">You seem to be lost...</div>
                    <div>
                    <div className="mx-auto my-3">
                      <p className="text-center">{randomQuote.text}</p>
                      <p className="mt-1 text-right">-{randomQuote.author}</p>
                    </div>
                    </div>
                  </div>
                } 
              />
            </div>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}