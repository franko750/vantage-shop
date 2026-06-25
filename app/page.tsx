import { createClient } from "@supabase/supabase-js";
import ResourceCard from "./ResourceCard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 30;

async function getDiscordStats() {
  try {
    const token = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_SERVER_ID;
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
      headers: { Authorization: `Bot ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return { members: data.approximate_member_count || 0, online: data.approximate_presence_count || 0 };
  } catch {
    return { members: 0, online: 0 };
  }
}

export default async function Home() {
  const [{ data: resources }, discord] = await Promise.all([
    supabase.from("resources").select("*").order("created_at", { ascending: false }),
    getDiscordStats(),
  ]);

  const list = resources || [];

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white">
      <nav className="border-b border-[#222] px-6 py-3 flex items-center justify-between">
        <span className="text-yellow-400 font-black text-xl tracking-widest">VANTAGE</span>
        <button className="bg-yellow-400 text-black px-4 py-2 rounded font-bold text-sm">Login</button>
      </nav>

      <div className="px-6 py-6">
        <h1 className="text-3xl font-black">
          Vantage – <span className="text-yellow-400">Free Scripts, MLO, Vehicles & Clothing</span>
        </h1>
        <p className="text-gray-400 mt-1 text-sm">The #1 source for FiveM resources — free & premium. New releases daily.</p>
      </div>

      <div className="px-6 mb-6 grid grid-cols-5 gap-3">
        {[
          { label: "TOTAL USERS", value: discord.members.toLocaleString() },
          { label: "ONLINE NOW", value: discord.online.toLocaleString() },
          { label: "DOWNLOADS", value: list.reduce((sum: number, r: any) => sum + (r.downloads || 0), 0).toLocaleString() },
          { label: "RESOURCES", value: list.length.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-[#111] border border-[#222] rounded-lg p-3 flex items-center gap-3">
            <div>
              <div className="text-yellow-400 text-xl font-black">{s.value}</div>
              <div className="text-gray-500 text-xs">{s.label}</div>
            </div>
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
            <input className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none" placeholder="Search releases..." />
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Sort By</div>
            <select className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-white focus:outline-none">
              <option>Newest First</option>
              <option>Most Downloaded</option>
              <option>Oldest First</option>
            </select>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Pricing</div>
            <div className="flex gap-2">
              {["All", "Free", "VIP"].map((p) => (
                <button key={p} className={`px-3 py-1 rounded text-xs font-bold ${p === "All" ? "bg-yellow-400 text-black" : "bg-[#111] border border-[#222] text-gray-400"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">FiveM Category</div>
            <div className="space-y-1">
              {["All", "Scripts", "MLO", "Vehicles", "Clothing", "Maps"].map((c) => (
                <div key={c} className="text-gray-400 text-sm hover:text-yellow-400 cursor-pointer">{c}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-gray-400 text-sm mb-4">{list.length} releases</div>
          {list.length === 0 ? (
            <div className="text-gray-500 text-sm">Δεν υπάρχουν resources ακόμα.</div>
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