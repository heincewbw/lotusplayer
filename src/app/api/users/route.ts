import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { email, password, role } = body

  if (!email?.trim()) return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 })
  if (!password || password.length < 6)
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 })
  if (!["admin", "user"].includes(role))
    return NextResponse.json({ error: "Role tidak valid" }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } })
  if (existing) return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email: email.trim(), password: hashed, role },
    select: { id: true, email: true, role: true, createdAt: true },
  })

  return NextResponse.json(user, { status: 201 })
}
