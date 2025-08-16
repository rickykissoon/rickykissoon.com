import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useMatches } from "@remix-run/react";
import { useState } from "react";
import { AnimatedRandomart } from "~/components/AnimatedRandomart";
import { DecodingText } from "~/components/DecodingText";
import { Post } from "~/components/Post";
import { RootLoaderData } from "~/root";
import { BlogSnippet, listBlogs } from "~/utils/blog.server";
import { getLatestArticles } from "~/utils/rss.server";
import { formatElapsedSubset, useNowSecond } from "~/utils/tools";

export const meta: MetaFunction = () => {
	return [
		{ title: "Welcome" },
		{ name: "description", content: "Welcome to my homepage!" },
	];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loader({request}: LoaderFunctionArgs) {
	const [{items: blogs}, feed] = await Promise.all([
		await listBlogs({
			select: ["id", "title", "slug", "tags", "createdAt"]
		}),
		await getLatestArticles()
	]);

	return {
		blogs,
		feed,
		isProd: process.env.ENVIRONMENT === 'production',
		serverNow: Date.now(),
	};
}

interface IndexProps {
	blogs: BlogSnippet[];
	feed: {
        _id: string;
        isRead: boolean;
        isNew: boolean;
        summary: string;
        hasFull: boolean;
        feedUrl: string;
        feedTitle?: string | undefined;
        guid?: string | undefined;
        title?: string | undefined;
        link?: string | undefined;
        isoDate?: string | undefined;
        contentHtml?: string | undefined;
        contentSnippet?: string | undefined;
    }[];
	isProd: boolean;
	serverNow: number;
}

export default function Index() {
	const { blogs, feed, isProd, serverNow } = useLoaderData<IndexProps>();
	const now = useNowSecond(serverNow);
	const matches = useMatches();
	const rootMatch = matches.find((match) => match.id === "root");
	const data = rootMatch?.data as RootLoaderData | undefined;
	const userId = data?.userId;
	
	return (
		<div className="flex w-full">
			<div className="m-3 lg:mx-10 w-full">
				<div className="flex text-[40px] font-thin">
					<div className="text-[#ff4f30]"><DecodingText text="RICKY" speed={100} placeholderChar="-" /></div>
					<div className="text-[#6e5e5d]"><DecodingText text="KISSOON" speed={100} placeholderChar="-" /></div>
				</div>
				<div className="text-sm mt-[-6px]">Software Developer</div>

				<div className="flex flex-col gap-2 mt-7 max-w-[700px]">
					<Post
						icon={
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
							</svg>
						}
						title={
							<div className="flex">
								<DecodingText text="Hello," speed={100} placeholderChar="-" />
								<div className="text-[#cecece] ml-2">
									<DecodingText text="<anonymous>" speed={100} placeholderChar="-" />
								</div>
							</div>
						}
						body={
							<div>
								<p>
									Welcome to my corner of the internet. This will serve as my portfolio, blog, and personal pastebin. Hopefully you find its contents interesting or useful.
								</p>

								<div className="flex mt-2 gap-3 text-[#6e5e5d] justify-end">
									<div>
										<Link to={"https://github.com/rickykissoon"}>
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-6 w-6" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
										</Link>
									</div>
									<div>
										<Link to={"https://www.linkedin.com/in/ricky-kissoon-58913647"}>
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path></svg>
										</Link>
									</div>
									<div>
										<Link to={"/rss.xml"} reloadDocument>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
										</Link>
									</div>
								</div>
							</div>
						}
					/>

					<Post
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                        } 
                        title={<Link to="/blogs" prefetch="render">Blogs</Link>} 
                        body={
							<div className="flex flex-col gap-2 text-[#ff4f30]">
								{blogs && blogs.map((blog) => {
									const elapsedMs = now - new Date(blog.createdAt).getTime();
									const formatted = formatElapsedSubset(elapsedMs, ["days", "hours", "minutes", "seconds"]);
									const isTest = blog?.tags?.includes("test") || false;

									return(
										<div key={blog.id} className="flex gap-2">
											<div className="text-[12px] tracking-tighter text-[#6e5e5d]">{formatted} | {isTest && '[TEST] | '}</div>

											{isProd && isTest ? (
												<div className="underline text-ellipsis text-[#6e5e5d]">{blog.title}</div>
											) : (
												<Link to={`/blogs/${blog.slug}`} className="underline text-ellipsis">{blog.title}</Link>
											)}
										</div>
									);
								})}
							</div>
						} 
                    />

					<Post
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                        } 
                        title={<Link to="/reader" prefetch="render">RSS Feeds</Link>} 
                        body={
							<div className="flex flex-col gap-2 text-[#ff4f30]">
								<ul className="space-y-3">
									{feed.map((f, i) => {
										const elapsedMs = now - new Date(f.isoDate || "").getTime();
										const formatted = formatElapsedSubset(elapsedMs, ["days", "hours", "minutes", "seconds"]);
										
										return(
											<div key={i} className="flex gap-2">
												<div className="text-[12px] tracking-tighter text-[#6e5e5d]">{formatted} | [{f.feedTitle}] |</div>
												<a href={f.link} target="_blank" rel="noreferrer" className="underline">
                    								{f.title || f.link}
                								</a>
											</div>
										);
									})}
								</ul>
							</div>
						} 
                    />

					<R1Key userId={userId} />

					<Post
						icon={
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
							</svg>
						}
						title={"NOTE"}
						body={
							<div className="text-xs">
								This is a personal website. Your data will not be sold, but I will collect some details to enable fun features. Don’t worry—it’s not like I’m
								<Link to="https://en.wikipedia.org/wiki/Facebook%E2%80%93Cambridge_Analytica_data_scandal">
									<span className="ml-2 bg-purple-950">Facebook</span>
								</Link>, 
								the
								<Link to="https://www.bbc.com/news/articles/cgj54eq4vejo">
									<span className="ml-2 bg-purple-950">British</span>
								</Link>, 
								or 
								<Link to="https://en.wikipedia.org/wiki/Big_Brother_(Nineteen_Eighty-Four)">
									<span className="ml-2 bg-purple-950">Big Brother</span>
								</Link>.
							</div>
						}
					/>
				</div>
			</div>
		</div>
	);
}

function R1Key({userId}: {userId: string | undefined}) {
	const [animationKey, setAnimationKey] = useState(0);
	const [openExplanation, setOpenExplanation] = useState(false);

	return(
		<div key={animationKey} className="flex flex-col border-[#6e5e5d] border-[1px] mt-1 w-full rounded-br-md">
			<div className="flex w-full">{userId && (
				<div className="flex flex-col my-3 gap-2 justify-center w-full">
					<div className="flex flex-wrap gap-2 mx-auto text-sm">
						<div className="text-nowrap">r1-key:</div>
						<div className="bg-[#272120] break-all">{<DecodingText text={userId} speed={150} placeholderChar="-" />}</div>
					</div>
					<div className="flex mx-auto w-full justify-center ">
						<div className="border border-[#6e5e5d] p-2">
							<AnimatedRandomart uuid={userId} speed={150} />
						</div>
					</div>

					<div className="flex pt-0 p-3 pb-0 gap-3 text-[#6e5e5d] justify-between">
						{openExplanation ? (
							<svg onClick={() => setOpenExplanation((prev) => !prev)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer">
							<path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
							</svg>
						) : (
							<svg onClick={() => setOpenExplanation((prev) => !prev)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer">
								<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
							</svg>
						)}

						<svg onClick={() => setAnimationKey((prev) => prev + 1)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer">
							<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
						</svg>
					</div>
					{openExplanation && (
						<>
							<div className="flex gap-2 mx-auto text-[11px] max-w-[400px]">
								This is your personal randomly generated identifier, used to recognize you as you navigate the site. No action is required on your part.
							</div>
							<div className="gap-2 mx-auto text-[11px] max-w-[400px]">
								The randomart image was generated using a method inspired by the
								<Link to="https://undeadly.org/cgi?action=article&sid=20080615022750" className="ml-2 bg-purple-950">Drunken Bishop algorithm</Link>
								, similar to the randomart produced when you create an SSH key using ssh-keygen. Instead of an SSH key fingerprint, this version uses a UUID as input.
							</div>
						</>
					)}
				</div>	
				)}
			</div>
		</div>
	);
}