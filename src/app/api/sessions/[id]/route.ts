import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const gameSession = await prisma.session.findUnique({
    where: { id: parseInt(id) },
    include: {
      entries: {
        include: { player: true },
        orderBy: { rowNumber: "asc" },
      },
    },
  })

  if (!gameSession) {
    return NextResponse.json({ error: "Session tidak ditemukan" }, { status: 404 })
  }

  return NextResponse.json(gameSession)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await prisma.session.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
