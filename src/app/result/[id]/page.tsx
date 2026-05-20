import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ResultView from "./ResultView"

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

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

  if (!gameSession) redirect("/sessions")

  return <ResultView session={gameSession} />
}
