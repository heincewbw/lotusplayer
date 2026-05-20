import { auth } from "@/auth"
import { redirect } from "next/navigation"
import NavBar from "@/components/NavBar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
