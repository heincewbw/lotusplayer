"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

type User = {
  id: string
  email: string
  role: string
  createdAt: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("user")
  const [editId, setEditId] = useState<string | null>(null)
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("user")
  const [editPassword, setEditPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { data: authSession } = useSession()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const res = await fetch("/api/users")
    if (res.ok) setUsers(await res.json())
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!newEmail.trim() || !newPassword) return
    setLoading(true)
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail.trim(), password: newPassword, role: newRole }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Gagal menambah user")
    } else {
      setNewEmail("")
      setNewPassword("")
      setNewRole("user")
      fetchUsers()
      router.refresh()
    }
    setLoading(false)
  }

  function startEdit(u: User) {
    setEditId(u.id)
    setEditEmail(u.email)
    setEditRole(u.role)
    setEditPassword("")
    setError("")
  }

  async function handleEdit(id: string) {
    setError("")
    if (!editEmail.trim()) return
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: editEmail.trim(), role: editRole, password: editPassword }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Gagal menyimpan perubahan")
      return
    }
    setEditId(null)
    setEditEmail("")
    setEditPassword("")
    fetchUsers()
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus user ini?")) return
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Gagal menghapus user")
      return
    }
    fetchUsers()
    router.refresh()
  }

  const inputClass =
    "border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
  const selectClass =
    "border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Kelola User</h1>

      {/* Add user form */}
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-6">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Email baru..."
          className={`flex-1 min-w-40 ${inputClass}`}
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Password (min. 6 karakter)"
          className={`flex-1 min-w-40 ${inputClass}`}
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className={selectClass}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={loading || !newEmail.trim() || !newPassword}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          Tambah
        </button>
      </form>

      {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}

      {/* Users table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {users.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-sm text-center py-8">Belum ada user.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-3 hidden sm:table-cell">Dibuat</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-slate-700 last:border-0">
                  <td className="px-4 py-3">
                    {editId === u.id ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 w-full max-w-xs"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {u.email}
                        {authSession?.user?.id === u.id && (
                          <span className="ml-2 text-xs text-gray-400 dark:text-slate-500">(kamu)</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === u.id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400"}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 hidden sm:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editId === u.id ? (
                      <div className="flex flex-col gap-1 items-end">
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Password baru (kosongkan jika tidak diubah)"
                          className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-xs bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-green-500 w-56"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(u.id)}
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
                      </div>
                    ) : (
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => startEdit(u)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        {authSession?.user?.id !== u.id && (
                          <button
                            onClick={() => handleDelete(u.id)}
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
