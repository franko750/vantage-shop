"use client";
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
    <main className="min-h-screen bg-[#0d0d0d] text-white">
      <nav className="border-b border-[#222] px-6 py-3 flex items-center justify-between">
        <span className="text-yellow-400 font-black text-xl tracking-widest">VANTAGE</span>
        {session ? (
          <div className="flex items-center gap-3">
            <img src={session.user?.image || ""} className="w-8 h-8 rounded-full" />
            <span className="text-sm text-gray-300">{session.user?.name}</span>
            <button onClick={() => signOut()} className="bg-[#222] text-white px-3 py-2 rounded text-sm">Logout</button>
          </div>
        ) : (
          <button onClick={() => signIn("discord")} className="bg-[#5865F2] text-white px-4 py-2 rounded font-bold text-sm">
            Login με Discord
          </button>
        )}
      </nav>

      <div className="px-6 py-6">
        <h1 className="text-3xl font-black">
          Vantage – <span className="text-yellow-400">Premium FiveM Resources</span>
        </h1>
        <p className="text-gray-400 mt-1 text-sm">Scripts, MLO, Vehicles & Clothing — free & premium. New releases daily.</p>
      </div>

      <div className="px-6 mb-6 grid grid-cols-5 gap-3">
        {[
          { label: "TOTAL USERS", value: discord.members.toLocaleString() },
          { label: "ONLINE NOW", value: discord.online.toLocaleString() },
          { label: "DOWNLOADS", value: resources.reduce((sum, r) => sum + (r.downloads || 0), 0).toLocaleString() },
          { label: "RESOURCES", value: resources.length.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-[#111] border border-[#222] rounded-lg p-3">
            <div className="text-yellow-400 text-xl font-black">{s.value}</div>
            <div className="text-gray-500 text-xs">{s.label}</div>
          </div>
        ))}
        <div className="bg-yellow-400 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-black font-black text-sm">Premium</div>
            <div className="text-black text-xs">Zero ads & instant downloads</div>
          </div>
          <span className="bg-black text-yellow-400 text-xs font-bold px-2 py-1 rounded">UPGRADE</span>
        </div>
      </div>

      <div className="px-6 flex gap-6">
        <div className="w-52 shrink-0 space-y-5">
          <div>
            <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Search</div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400"
              placeholder="Search releases..." />
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Sort By</div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-white focus:outline-none">
              <option value="newest">Newest First</option>
              <option value="downloads">Most Downloaded</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Pricing</div>
            <div className="flex gap-2">
              {["All", "Free", "VIP"].map((p) => (
                <button key={p} onClick={() => setPricing(p)}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${pricing === p ? "bg-yellow-400 text-black" : "bg-[#111] border border-[#222] text-gray-400 hover:border-yellow-400"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">FiveM Category</div>
            <div className="space-y-1">
              {["All", "Scripts", "MLO", "Vehicles", "Clothing", "Maps"].map((c) => (
                <div key={c} onClick={() => setCategory(c)}
                  className={`text-sm cursor-pointer transition ${category === c ? "text-yellow-400 font-bold" : "text-gray-400 hover:text-yellow-400"}`}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-gray-400 text-sm mb-4">{list.length} releases</div>
          {!session ? (
            <div className="text-center py-20">
              <p className="text-gray-400 mb-4">Κάνε login με Discord για να δεις και να κατεβάσεις resources!</p>
              <button onClick={() => signIn("discord")} className="bg-[#5865F2] text-white px-6 py-3 rounded font-bold">
                Login με Discord
              </button>
            </div>
          ) : list.length === 0 ? (
            <div className="text-gray-500 text-sm">Δεν βρέθηκαν resources.</div>
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
