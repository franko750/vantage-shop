"use client";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import ResourceCard from "./ResourceCard";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { data: session } = useSession();
  const [resources, setResources] = useState<any[]>([]);
  const [discord, setDiscord] = useState({ members: 0, online: 0 });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [pricing, setPricing] = useState("All");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("resources").select("*");
      setResources(data || []);
      const res = await fetch("/api/discord-stats");
      const d = await res.json();
      setDiscord(d);
    }
    load();
  }, []);

  let list = [...resources];
  if (search) list = list.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
  if (pricing === "Free") list = list.filter(r => r.is_free);
  if (pricing === "VIP") list = list.filter(r => !r.is_free);
  if (category !== "All") list = list.filter(r => r.category === category);
  if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  if (sort === "oldest") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  if (sort === "downloads") list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-black text-2xl tracking-widest">VANTAGE</span>
          <span className="text-[10px] bg-yellow-400 text-black font-black px-2 py-0.5 rounded ml-1">SHOP</span>
        </div>
        {session ? (
          <div className="flex items-center gap-3">
            <img src={session.user?.image || ""} className="w-8 h-8 rounded-full border border-yellow-400" />
            <span className="text-sm text-gray-300">{session.user?.name}</span>
            <button onClick={() => signOut()} className="bg-[#1a1a1a] text-white px-3 py-2 rounded text-sm hover:bg-[#222] transition">Logout</button>
          </div>
        ) : (
          <button onClick={() => signIn("discord")} className="bg-[#5865F2] text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-2 hover:bg-[#4752c4] transition">
            Login με Discord
          </button>
        )}
      </nav>

      {/* Hero */}
      <div className="px-6 py-10 border-b border-[#1a1a1a]">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black mb-3 leading-tight">
            Premium FiveM Resources<br />
            <span className="text-yellow-400">για τον Server σου</span>
          </h1>
          <p className="text-gray-500 text-sm">Scripts, MLO, Vehicles & Clothing — επιλεγμένα και έτοιμα για χρήση. Νέες κυκλοφορίες κάθε εβδομάδα.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-5 grid grid-cols-5 gap-3 border-b border-[#1a1a1a]">
        {[
          { label: "MEMBERS", value: discord.members.toLocaleString(), icon: "👥" },
          { label: "ONLINE", value: discord.online.toLocaleString(), icon: "🟢" },
          { label: "DOWNLOADS", value: resources.reduce((sum, r) => sum + (r.downloads || 0), 0).toLocaleString(), icon: "⬇️" },
          { label: "RESOURCES", value: resources.length.toString(), icon: "📦" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="text-yellow-400 text-xl font-black">{s.value}</div>
              <div className="text-gray-600 text-xs">{s.label}</div>
            </div>
          </div>
        ))}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:opacity-90 transition">
          <div>
            <div className="text-black font-black text-sm">VIP Access</div>
            <div className="text-black/70 text-xs">Exclusive resources</div>
          </div>
          <span className="bg-black text-yellow-400 text-xs font-black px-2 py-1 rounded">JOIN</span>
        </div>
      </div>

      {/* Main */}
      <div className="px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-52 shrink-0 space-y-6">
          <div>
            <div className="text-gray-600 text-xs mb-2 uppercase tracking-widest font-bold">Search</div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-yellow-400 transition"
              placeholder="Search releases..." />
          </div>
          <div>
            <div className="text-gray-600 text-xs mb-2 uppercase tracking-widest font-bold">Sort By</div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              <option value="newest">Newest First</option>
              <option value="downloads">Most Downloaded</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          <div>
            <div className="text-gray-600 text-xs mb-2 uppercase tracking-widest font-bold">Pricing</div>
            <div className="flex gap-2">
              {["All", "Free", "VIP"].map((p) => (
                <button key={p} onClick={() => setPricing(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${pricing === p ? "bg-yellow-400 text-black" : "bg-[#111] border border-[#1a1a1a] text-gray-500 hover:border-yellow-400"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-gray-600 text-xs mb-2 uppercase tracking-widest font-bold">Category</div>
            <div className="space-y-1">
              {["All", "Scripts", "MLO", "Vehicles", "Clothing", "Maps"].map((c) => (
                <div key={c} onClick={() => setCategory(c)}
                  className={`text-sm cursor-pointer px-2 py-1 rounded transition ${category === c ? "text-yellow-400 font-bold bg-yellow-400/10" : "text-gray-500 hover:text-yellow-400"}`}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1">
          <div className="text-gray-600 text-xs mb-4 uppercase tracking-widest">{list.length} releases</div>
          {list.length === 0 ? (
            <div className="text-gray-600 text-sm">Δεν βρέθηκαν resources.</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {list.map((r: any) => (
                <ResourceCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

