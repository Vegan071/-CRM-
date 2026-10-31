import { NextResponse } from "next/server";
import { requireUser } from "@/shared/api/session";
import { listGroupsPage, type GroupStatus } from "@/features/group-listners/api/queries";

export async function GET(req: Request) {
    await requireUser();
    const sp = new URL(req.url).searchParams;

    const data = await listGroupsPage({
        q: sp.get("q") || undefined,
        status: (sp.get("status") as GroupStatus) || undefined,
        teacherId: sp.get("teacherId") || undefined,
        page: Math.max(1, Number(sp.get("page")) || 1),
        pageSize: 20,
    });

    return NextResponse.json(data);
}