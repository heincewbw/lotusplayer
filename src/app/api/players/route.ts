import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
  })
  return NextResponse.json(players)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nama player wajib diisi" }, { status: 400 })
  }

  const player = await prisma.player.create({
    data: { name: name.trim() },
  })
  return NextResponse.json(player, { status: 201 })
}
