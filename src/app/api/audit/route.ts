import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { auditQuerySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const query = auditQuerySchema.parse(searchParams);

    const where: Record<string, unknown> = {};
    if (query.entity) where.entity = query.entity;
    if (query.entityId) where.entityId = query.entityId;
    if (query.batchId) where.batchId = query.batchId;
    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: query.limit ?? 50,
        skip: query.offset ?? 0,
        include: {
          user: { select: { id: true, name: true } },
          batch: { select: { id: true, code: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ error: "Error al obtener bitácora" }, { status: 500 });
  }
}
