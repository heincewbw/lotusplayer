import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { email, role, password } = body

  if (!email?.trim()) return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 })
  if (!["admin", "user"].includes(role))
    return NextResponse.json({ error: "Role tidak valid" }, { status: 400 })
  if (password !== undefined && password !== "" && password.length < 6)
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 })

  const existing = await prisma.user.findFirst({
    where: { email: email.trim(), NOT: { id } },
  })
  if (existing) return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 })

  const data: { email: string; role: string; password?: string } = {
    email: email.trim(),
    role,
  }
  if (password && password.length >= 6) {
    data.password = await bcrypt.hash(password, 10)
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, role: true, createdAt: true },
  })

  return NextResponse.json(user)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params

  if (session.user.id === id) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
