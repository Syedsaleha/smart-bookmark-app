'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase'

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const formatUrl = (u: string) => u.startsWith('http') ? u : `https://${u}`

  const fetchBookmarks = useCallback(async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setBookmarks(data)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchBookmarks()

    const channel = supabase.channel('realtime-bookmarks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks' }, () => {
        fetchBookmarks()
      }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchBookmarks])

  // --- OPTIMISTIC ADD LOGIC ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const newUrl = formatUrl(url)
    const tempId = Math.random().toString() // Temporary ID for rendering

    // 1. Optimistically update UI
    const tempBookmark = {
      id: tempId,
      title: title,
      url: newUrl,
      user_id: user.id,
      created_at: new Date().toISOString(),
    }
    setBookmarks(prev => [tempBookmark, ...prev])
    
    // Clear inputs immediately
    const savedTitle = title
    const savedUrl = url
    setTitle('')
    setUrl('')

    // 2. Actual database call
    const { error } = await supabase.from('bookmarks').insert([
      { title: savedTitle, url: newUrl, user_id: user.id }
    ])

    if (error) {
      console.error("Add failed:", error.message)
      fetchBookmarks() // Re-fetch to remove the fake entry
      alert("Failed to save bookmark.")
    }
  }

  // --- OPTIMISTIC DELETE LOGIC ---
  const handleDelete = async (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
    
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    
    if (error) {
      fetchBookmarks() 
      alert("Failed to delete bookmark.")
    }
  }

  const login = () => supabase.auth.signInWithOAuth({ 
    provider: 'google', 
    options: { redirectTo: `${window.location.origin}/auth/callback` } 
  })

  if (!user) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 text-white">
      <div className="text-center bg-slate-800/50 p-12 rounded-3xl border border-slate-700 backdrop-blur-md shadow-2xl">
        <h1 className="text-4xl font-black mb-2">Smart<span className="text-indigo-400">Mark</span></h1>
        <p className="text-slate-400 mb-8">Your digital library, synced in real-time.</p>
        <button onClick={login} className="flex items-center gap-3 bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all active:scale-95">
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
          Sign in with Google
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">My Bookmarks</h1>
          <button onClick={() => supabase.auth.signOut().then(() => setUser(null))} className="text-slate-400 hover:text-white text-sm">Logout</button>
        </header>

        <section className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl mb-10 shadow-xl">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
            <input className="flex-1 bg-slate-900/50 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <input className="flex-1 bg-slate-900/50 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} required />
            <button className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">Add</button>
          </form>
        </section>

        <div className="grid gap-4">
          {bookmarks.map(b => (
            <div key={b.id} className="group bg-slate-800/30 border border-slate-700/50 p-5 rounded-2xl flex justify-between items-center hover:bg-slate-800/60 transition-all">
              <div className="truncate pr-4">
                <h3 className="text-white font-semibold truncate">{b.title}</h3>
                <a href={formatUrl(b.url)} target="_blank" className="text-indigo-400 text-sm hover:underline truncate block">{b.url}</a>
              </div>
              <button onClick={() => handleDelete(b.id)} className="opacity-0 group-hover:opacity-100 text-red-400 bg-red-500/10 p-2 rounded-lg hover:bg-red-500/20 transition-all">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}