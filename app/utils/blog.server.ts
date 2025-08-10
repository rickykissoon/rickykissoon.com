import { Document, ObjectId, SortDirection } from "mongodb"
import { getDb } from "./db.server";

export type BlogDoc = {
    _id: ObjectId;
    title: string;
    slug: string;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt?: Date;
} & Document;

export type BlogSnippet = {
    id: string;
    title: string;
    slug: string;
    content?: string;
    tags?: string[];
    createdAt: string;
    updatedAt?: string;
}

const serialize = (doc: Partial<BlogDoc>): BlogSnippet => ({
    id: doc._id!.toString(),
    title: doc.title!,
    slug: doc.slug!,
    content: doc.content,
    tags: doc.tags,
    createdAt: doc.createdAt?.toISOString()!,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : undefined,
});

type Selectable = keyof BlogSnippet;

type ListBlogsOpts = {
    filter?: Partial<Pick<BlogDoc, "slug" | "tags">> & Document;
    sort?: Record<keyof BlogDoc, SortDirection>;
    select?: Selectable[];
    page?: number;
    perPage?: number;
    skip?: number;
    limit?: number;
}

export async function listBlogs(opts: ListBlogsOpts = {}) {
    const {
        filter = {},
        sort = { createdAt: -1 },
        select,
        page,
        perPage,
        skip: rawSkip,
        limit: rawLimit,
    } = opts;

    const resolvedPerPage = rawLimit ?? perPage ?? 10;
    const resolvedSkip = rawSkip ?? (page && perPage ? (Math.max(1, page) - 1) * Math.max(1, perPage) : 0);
    const db = await getDb();
    const col = db.collection<BlogDoc>("blogs");

    const fieldMap: Record<Selectable, string> = {
        id: "_id",
        title: "title",
        slug: "slug",
        content: "content",
        tags: "tags",
        createdAt: "createdAt",
        updatedAt: "updatedAt"
    };

    const projection = select && select.length ? Object.fromEntries(select.map((k) => [fieldMap[k], 1])) : undefined;
    const [docs, total] = await Promise.all([
        col.find(filter, { projection })
            .sort(sort)
            .skip(resolvedSkip)
            .limit(resolvedPerPage)
            .toArray(),
        col.countDocuments(filter),
    ]);

    const itemsAll = docs.map(serialize);
    const items = !select || !select.length ? itemsAll : (itemsAll.map((row) => Object.fromEntries(select.map((k) => [k, row[k]]))) as Pick<BlogSnippet, typeof select[number]>[]);
    const pageNum = rawSkip != null ? Math.floor(rawSkip / resolvedPerPage) + 1 : Math.max(1, page ?? 1);
    const perPageNum = resolvedPerPage;
    const totalPages = Math.max(1, Math.ceil(total / perPageNum));

    return {
        items,
        pagination: {
            page: pageNum,
            perPage: perPageNum,
            total,
            totalPages,
            hasPrev: pageNum > 1,
            hasNext: pageNum < totalPages,
        },
    };
}

export async function getBlogBySlug(slug: string, select?: Selectable[]) {
    const { items } = await listBlogs({ filter: { slug }, limit: 1, select });
    return items[0] ?? null;
}