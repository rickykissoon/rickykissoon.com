import { LoaderFunction } from "react-router";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { createHash } from "crypto";
import { ObjectId } from "mongodb";
import { useMemo, useState } from "react";
import { AnimatedRandomart } from "~/components/AnimatedRandomart";
import { Post } from "~/components/Post";
import { getOrCreateSession } from "~/sessions";
import { getDb } from "~/utils/db.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { userId } = await getOrCreateSession(request);

    const url = new URL(request.url);
    const page = toInt(url.searchParams.get("page"), 1);
    const perPage = 20;
    const skip = (page - 1) * perPage;
    const db = await getDb();
    const collection = db.collection("tracking_events");

    const [result] = await collection.aggregate(
        [
            { $group: { _id: "$userId", firstTimestamp: { $min: "$timestamp" } } },
            { $sort: { firstTimestamp: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: perPage },
                        {
                            $project: {
                                _id: 0,
                                userId: "$_id",
                                firstEvent: { timestamp: "$firstTimestamp" },
                            },
                        },
                    ],
                    meta: [{ $count: "total" }],
                },
            },
            {
                $project: {
                    data: 1,
                    total: { $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0] },
                },
            },
        ],
        { allowDiskUse: true }
    ).toArray();

    const pageDocs = result?.data ?? [];
    const total = result?.total ?? 0;
    const userEvents = await Promise.all(
        pageDocs.map(async (d: any) => ({
            _id: d.userId,
            hashedId: d.userId ? await hashUserId(d.userId) : null,
            firstEvent: {
                timestamp: d.firstEvent.timestamp,
            },
        }))
    );

    const totalPages = Math.max(1, Math.ceil(total / perPage));

    return {
        pagination: {
            page,
            perPage,
            total,
            totalPages,
            hasPrev: page > 1,
            hasNext: page < totalPages,
        },
        userEvents,
        userId: await hashUserId(userId),
    };
}

async function hashUserId(userId: string): Promise<string> {
    return createHash("sha256").update(userId).digest("hex");
}

function toInt(v: string | null, def: number, min = 1, max = 200) {
    const n = Number(v);
    if (!Number.isFinite(n)) return def;
    return Math.max(min, Math.min(max, Math.floor(n)));
}

interface EventDocument {
    _id: ObjectId;
    userId: string;
    eventType: string;
    eventData: Record<string, any>;
    timestamp: Date;
}

interface UserEvent {
    _id: string;
    hashedId: string;
    firstEvent: EventDocument;
}

interface RandomartGalleryProps {
    userId: string;
    userEvents: UserEvent[];
    pagination: {
        page: number; perPage: number; total: number; totalPages: number;
        hasPrev: boolean; hasNext: boolean;
    };
}

export default function RandomartGallery() {
    const {userEvents, pagination} = useLoaderData<RandomartGalleryProps>();
    const [animationKey, setAnimationKey] = useState(0);
    const [params] = useSearchParams();

    const prevParams = useMemo(() => {
        const p = new URLSearchParams(params);
        p.set("page", String(Math.max(1, pagination.page - 1)));
        p.set("perPage", String(pagination.perPage));
        return p.toString();
    }, [params, pagination.page, pagination.perPage]);

    const nextParams = useMemo(() => {
        const p = new URLSearchParams(params);
        p.set("page", String(pagination.page + 1));
        p.set("perPage", String(pagination.perPage));
        return p.toString();
    }, [params, pagination.page, pagination.perPage]);

    return(
        <div className="flex w-full">
            <div className="m-3 lg:mx-10 w-full">
                <div className="mt-7 w-full">
                    <Post
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                            </svg>
                        } 
                        title={<div>Randomart Gallery</div>} 
                        body={
                            <div>
                                <div>Each one represents a unique visitor of this site.</div>
                                <div className="flex text-[#6e5e5d] justify-end leading-[1.8]">Replay All
						            <svg onClick={() => setAnimationKey((prev) => prev + 1)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer">
						                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
						            </svg>
                                </div>
                            </div>        
                        } 
                    />

                    <div key={animationKey} className="flex flex-wrap justify-center gap-1 mt-1">
                        {userEvents?.map((userEvent: UserEvent) => (
                            <OneRandomArt key={userEvent._id} userEvent={userEvent} />
                        ))}
                    </div>

                    <div className="flex item-center justify-between mt-6 text-sm text-[#6e5e5d]">
                        <div>
                            Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                            {" • "}
                            Showing <strong>{pagination.perPage}</strong> per page
                        </div>
                        <div className="flex gap-2">
                            {pagination.hasPrev ? (
                                <Link
                                    className="px-3 py-1 border border-[#6e5e5d] hover:bg-[#3b0764] hover:text-white"
                                    to={`?${prevParams}`}
                                    preventScrollReset
                                >← Prev</Link>
                            ) : (
                                <span className="px-3 py-1 opacity-40 border border-transparent">← Prev</span>
                            )}
                            {pagination.hasNext ? (
                                <Link
                                    className="px-3 py-1 border border-[#6e5e5d] hover:bg-[#3b0764] hover:text-white"
                                    to={`?${nextParams}`}
                                    preventScrollReset
                                >Next →</Link>
                            ) : (
                                <span className="px-3 py-1 opacity-40 border border-transparent">Next →</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OneRandomArt({userEvent}: {userEvent: UserEvent}) {
    const {userId} = useLoaderData<RandomartGalleryProps>();
    const [animationKey, setAnimationKey] = useState(0);

    return(
        <div key={animationKey} onClick={() => setAnimationKey((prev) => prev + 1)} className="cursor-pointer border border-[#6e5e5d] p-2 pb-0" style={{ borderColor: userId === userEvent.hashedId ? '#3b0764' : '#6e5e5d'}}>
            <AnimatedRandomart uuid={userEvent.hashedId} speed={150} />
            <div className="flex text-[#6e5e5d] justify-between border-t border-[#6e5e5d] mt-2 py-1">
                {userEvent.firstEvent.timestamp.toISOString()}
			    <svg onClick={() => setAnimationKey((prev) => prev + 1)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer">
			        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
			    </svg>
            </div>
        </div>
    );
}