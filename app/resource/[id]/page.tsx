"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResourcePage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("resources").select("*").eq("id", id).single();
      setResource(data);
    }
    load();
  }, [id]);

  if (!resource) return (
    <main className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </main>
  );

  async function handleStripe() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId: resource.id }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white">
      <nav className="border-b border-[#222] px-6 py-3">
        <a href="/" className="text-yellow-400 font-black text-xl">VANTAGE</a>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="w-full h-72 bg-[#1a1a1a] rounded-xl overflow-hidden mb-8">
          {resource.image_url ? (
            <img src={resource.image_url} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">No Preview</div>
          )}
        </div>
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#222] text-gray-300 text-xs px-3 py-1 rounded">{resource.category}</span>
              <span className={resource.is_free ? "text-green-400 text-sm font-bold" : "text-purple-400 text-sm font-bold"}>
                {resource.is_free ? "Free" : resource.price + "€"}
              </span>
            </div>
            <h1 className="text-3xl font-black mb-4">{resource.title}</h1>
            <p className="text-gray-400 mb-6">{resource.description || "No description."}</p>
            <div className="text-sm text-gray-500">Downloads: {resource.downloads || 0}</div>
          </div>
          <div className="w-64 shrink-0">
            <div className="bg-[#111] border border-[#222] rounded-xl p-5">
              <div className="text-2xl font-black mb-4 text-center">
                {resource.is_free ? <span className="text-green-400">Free</span> : <span className="text-yellow-400">{resource.price}€</span>}
              </div>
              {resource.is_free ? (
                <a href={resource.download_url} target="_blank" className="block w-full bg-green-500 text-white font-black py-3 rounded text-center">Download</a>
              ) : !showPayment ? (
                <button onClick={() => setShowPayment(true)} className="w-full bg-yellow-400 text-black font-black py-3 rounded">Buy {resource.price}€</button>
              ) : (
                <div className="space-y-3">
                  <button onClick={handleStripe} className="w-full bg-yellow-400 text-black font-black py-2 rounded text-sm">Pay with Card (Stripe)</button>
                  <button onClick={() => setShowPayment(false)} className="w-full text-gray-500 text-xs">Cancel</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
