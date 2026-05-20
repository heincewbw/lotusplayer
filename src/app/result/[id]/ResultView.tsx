"use client"
import Link from "next/link"

type Entry = {
  rowNumber: number
  ambil: number
  sisa: number
  player: { name: string }
}

type Session = {
  id: number
  date: Date | string
  entries: Entry[]
}

function formatDate(dateStr: Date | string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
}

function fmt(n: number) {
  return n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString()
}

export default function ResultView({ session }: { session: Session }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-8 px-4">
      <div className="w-full max-w-md">
        {/* Print-friendly table */}
        <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
          {/* Session header */}
          <div className="grid grid-cols-2 border-b-2 border-slate-300">
            <div className="px-4 py-3 font-bold text-slate-700 border-r-2 border-slate-300">
              Session
            </div>
            <div className="px-4 py-3 font-bold text-slate-700">
              {formatDate(session.date)}
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2rem_1fr_5rem_5rem_6rem] border-b border-slate-300 bg-slate-100">
            <div className="px-2 py-2 text-xs font-bold text-slate-600 text-center border-r border-slate-300">#</div>
            <div className="px-3 py-2 text-xs font-bold text-slate-600 border-r border-slate-300">Nama Player</div>
            <div className="px-2 py-2 text-xs font-bold text-slate-600 text-right border-r border-slate-300">Ambil</div>
            <div className="px-2 py-2 text-xs font-bold text-slate-600 text-right border-r border-slate-300">Sisa</div>
            <div className="px-2 py-2 text-xs font-bold text-slate-600 text-right">Profit/Loss</div>
          </div>

          {/* All 9 rows (filled + empty) */}
          {Array.from({ length: 9 }, (_, i) => {
            const entry = session.entries.find((e) => e.rowNumber === i + 1)
            const pl = entry ? entry.sisa - entry.ambil : null
            return (
              <div
                key={i}
                className="grid grid-cols-[2rem_1fr_5rem_5rem_6rem] border-b border-slate-200 last:border-0"
              >
                <div className="px-2 py-2.5 text-xs text-slate-400 text-center border-r border-slate-200">
                  {i + 1}
                </div>
                <div className="px-3 py-2.5 text-sm font-medium text-slate-800 border-r border-slate-200">
                  {entry?.player.name ?? ""}
                </div>
                <div className="px-2 py-2.5 text-sm text-right text-slate-600 border-r border-slate-200">
                  {entry ? entry.ambil.toLocaleString() : ""}
                </div>
                <div className="px-2 py-2.5 text-sm text-right text-slate-600 border-r border-slate-200">
                  {entry ? entry.sisa.toLocaleString() : ""}
                </div>
                <div
                  className={`px-2 py-2.5 text-sm font-semibold text-right ${
                    pl !== null
                      ? pl > 0
                        ? "text-green-600"
                        : pl < 0
                        ? "text-red-500"
                        : "text-slate-400"
                      : ""
                  }`}
                >
                  {pl !== null ? fmt(pl) : ""}
                </div>
              </div>
            )
          })}

          {/* Balance footer */}
          <div className="grid grid-cols-[2rem_1fr_5rem_5rem_6rem] border-t-2 border-slate-300 bg-slate-50">
            <div className="col-span-4 px-4 py-3 text-sm font-bold text-slate-700 text-right border-r border-slate-300">
              Balance
            </div>
            <div className="px-2 py-3 text-sm font-bold text-slate-700 text-right">
              0
            </div>
          </div>
        </div>

        {/* Action buttons — hidden when screenshotting (can be hidden manually) */}
        <div className="mt-6 flex gap-3 justify-center print:hidden">
          <Link
            href="/sessions/new"
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Session Baru
          </Link>
          <Link
            href="/sessions"
            className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2.5 border border-slate-300 rounded-lg"
          >
            Riwayat
          </Link>
        </div>
      </div>
    </div>
  )
}
