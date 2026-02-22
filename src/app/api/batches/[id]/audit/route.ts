import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === "VIEWER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;

    const logs = await prisma.auditLog.findMany({
      where: { batchId: id },
      orderBy: { timestamp: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching batch audit logs:", error);
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 });
  }
}
