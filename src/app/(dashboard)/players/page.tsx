"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

type Player = { id: number; name: string }

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newName, setNewName] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: authSession } = useSession()
  const isAdmin = authSession?.user?.role === "admin"

  useEffect(() => {
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    const res = await fetch("/api/players")
    if (res.ok) setPlayers(await res.json())
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setLoading(true)
    await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setNewName("")
    setLoading(false)
    fetchPlayers()
    router.refresh()
  }

  async function handleEdit(id: number) {
    if (!editName.trim()) return
    await fetch(`/api/players/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    })
    setEditId(null)
    setEditName("")
    fetchPlayers()
    router.refresh()
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus player ini?")) return
    await fetch(`/api/players/${id}`, { method: "DELETE" })
    fetchPlayers()
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Kelola Player</h1>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama player baru..."
          className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={loading || !newName.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          Tambah
        </button>
      </form>

      {/* Players table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {players.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-sm text-center py-8">
            Belum ada player. Tambahkan di atas.
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-3">Nama Player</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-slate-700 last:border-0">
                  <td className="px-4 py-3 text-sm text-gray-400 dark:text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    {editId === p.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleEdit(p.id)}
                        className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{p.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editId === p.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(p.id)}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => { setEditId(p.id); setEditName(p.name) }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-xs text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
