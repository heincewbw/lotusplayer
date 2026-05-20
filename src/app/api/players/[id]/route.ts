import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nama player wajib diisi" }, { status: 400 })
  }

  const player = await prisma.player.update({
    where: { id: parseInt(id) },
    data: { name: name.trim() },
  })
  return NextResponse.json(player)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.player.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
