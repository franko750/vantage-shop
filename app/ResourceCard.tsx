"use client";

type Resource = {
  id: string;
  title: string;
  category: string;
  is_free: boolean;
  price: number;
  image_url: string;
  download_url: string;
  downloads: number;
  created_at: string;
};

export default function ResourceCard({ r }: { r: Resource }) {
  return (
    <div
      onClick={() => window.location.href = `/resource/${r.id}`}
      className="bg-[#111] border border-[#222] rounded-lg overflow-hidden hover:border-yellow-400 transition cursor-pointer"
    >
      <div className="relative bg-[#1a1a1a] h-40 flex items-center justify-center overflow-hidden">
        {r.image_url ? (
          <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-600 text-sm">Preview</span>
        )}
        <span className="absolute top-2 right-2 bg-[#222] text-gray-300 text-xs px-2 py-0.5 rounded">{r.category}</span>
      </div>
      <div className="p-3">
        <div className="font-bold text-sm mb-2">{r.title}</div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>📅 {new Date(r.created_at).toLocaleDateString("el-GR")}</span>
          <span>⬇️ {(r.downloads || 0).toLocaleString()}</span>
          <span className={`font-bold ${r.is_free ? "text-green-400" : "text-purple-400"}`}>
            {r.is_free ? "Free" : `${r.price}€`}
          </span>
        </div>
      </div>
    </div>
  );
}
