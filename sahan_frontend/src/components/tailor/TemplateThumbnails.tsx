// Mini thumbnail previews shown inside the template picker modal.
// Each is a purely decorative skeleton of the real template layout.

export function ModernMiniPreview() {
  return (
    <div className="w-full aspect-[4/5] rounded-md border border-slate-200 overflow-hidden bg-white flex flex-col">
      <div className="bg-slate-800 px-2 py-1.5 flex items-center gap-1.5 shrink-0">
        <div className="w-4 h-4 rounded-full bg-blue-400 shrink-0" />
        <div className="space-y-0.5">
          <div className="h-1.5 w-12 bg-white/80 rounded-sm" />
          <div className="h-1 w-8 bg-white/40 rounded-sm" />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/5 bg-slate-100 p-1 space-y-1 shrink-0 border-r border-slate-200">
          <div className="h-1 w-3/4 bg-blue-400 rounded-sm" />
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-0.5">
              <div className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
              <div className={`h-0.5 rounded-sm bg-slate-300 ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`} />
            </div>
          ))}
          <div className="h-px bg-slate-200" />
          <div className="h-1 w-2/3 bg-blue-400 rounded-sm" />
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-0.5 rounded-sm bg-slate-300 ${i % 2 === 0 ? "w-full" : "w-3/4"}`} />
          ))}
        </div>
        <div className="flex-1 p-1 space-y-1 overflow-hidden">
          <div className="h-1 w-2/3 bg-slate-700 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-200 rounded-sm" />
          <div className="h-0.5 w-5/6 bg-slate-200 rounded-sm" />
          <div className="h-0.5 w-3/4 bg-slate-200 rounded-sm" />
          <div className="h-px bg-slate-100" />
          <div className="h-1 w-1/2 bg-slate-700 rounded-sm" />
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`h-0.5 rounded-sm bg-slate-200 ${i % 2 === 0 ? "w-full" : "w-4/5"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ExecutiveMiniPreview() {
  return (
    <div className="w-full aspect-[4/5] rounded-md border border-slate-200 overflow-hidden bg-white flex flex-col">
      <div className="bg-[#1e2d4a] px-2 py-2 shrink-0">
        <div className="h-2 w-14 bg-white/90 rounded-sm mb-0.5" />
        <div className="h-0.5 w-5 bg-[#b8972e] mb-1" />
        <div className="h-0.5 w-16 bg-white/30 rounded-sm" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[35%] bg-slate-100 p-1 space-y-1 shrink-0 border-r-2 border-[#1e2d4a]">
          <div className="h-0.5 w-3/4 bg-[#1e2d4a] rounded-sm" />
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-0.5">
              <div className="w-1 h-1 rounded-full bg-[#b8972e] shrink-0" />
              <div className={`h-0.5 bg-slate-300 rounded-sm ${i === 0 ? "w-full" : i === 1 ? "w-3/4" : "w-1/2"}`} />
            </div>
          ))}
          <div className="h-0.5 w-2/3 bg-[#1e2d4a] rounded-sm mt-1" />
          {[0, 1].map(i => (
            <div key={i} className="flex items-center gap-0.5">
              <div className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
              <div className={`h-0.5 bg-slate-300 rounded-sm ${i === 0 ? "w-3/4" : "w-1/2"}`} />
            </div>
          ))}
        </div>
        <div className="flex-1 p-1 space-y-1 overflow-hidden">
          <div className="h-0.5 w-2/3 bg-[#1e2d4a] rounded-sm" />
          <div className="h-0.5 w-full bg-slate-200 rounded-sm" />
          <div className="h-0.5 w-4/5 bg-slate-200 rounded-sm" />
          {[0, 1].map(i => (
            <div key={i} className="pl-1 border-l-2 border-[#b8972e] space-y-0.5 mt-0.5">
              <div className="h-1 w-3/4 bg-[#1e2d4a] rounded-sm" />
              <div className="h-0.5 w-1/2 bg-[#b8972e] rounded-sm" />
              <div className="h-0.5 w-full bg-slate-200 rounded-sm" />
              <div className="h-0.5 w-4/5 bg-slate-200 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MinimalistMiniPreview() {
  return (
    <div className="w-full aspect-[4/5] rounded-md border border-slate-200 overflow-hidden bg-white flex flex-col">
      <div className="h-0.5 bg-slate-700 shrink-0" />
      <div className="px-2 py-1.5 border-b border-slate-200 shrink-0">
        <div className="h-1.5 w-3/4 bg-slate-800 rounded-sm mb-0.5" />
        <div className="h-0.5 w-1/2 bg-slate-400 rounded-sm" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[30%] bg-slate-50 p-1 space-y-0.5 shrink-0 border-r border-slate-200">
          <div className="h-0.5 w-3/4 bg-slate-500 rounded-sm mb-0.5" />
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-0.5 rounded-sm bg-slate-300 ${i === 0 ? "w-full" : i === 1 ? "w-3/4" : "w-1/2"}`} />
          ))}
          <div className="h-px bg-slate-200" />
          <div className="h-0.5 w-2/3 bg-slate-500 rounded-sm mb-0.5" />
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-0.5 bg-slate-200 rounded-sm" style={{ width: `${60 + (i % 2) * 20}%` }} />
          ))}
        </div>
        <div className="flex-1 p-1 space-y-0.5 overflow-hidden">
          <div className="h-0.5 w-2/3 bg-slate-600 rounded-sm" />
          <div className="h-px bg-slate-200" />
          <div className="h-0.5 w-full bg-slate-200 rounded-sm" />
          <div className="h-0.5 w-5/6 bg-slate-200 rounded-sm" />
          <div className="h-px bg-slate-100" />
          <div className="h-0.5 w-1/2 bg-slate-600 rounded-sm" />
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`h-0.5 rounded-sm bg-slate-200 ${i % 2 === 0 ? "w-full" : "w-4/5"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HarvardMiniPreview() {
  return (
    <div className="w-full aspect-[4/5] rounded-md border border-slate-200 overflow-hidden bg-white p-2 flex flex-col">
      <div className="flex flex-col items-center mb-1.5 shrink-0">
        <div className="h-2 w-3/4 bg-slate-800 rounded-sm mb-0.5" />
        <div className="h-0.5 w-full bg-slate-300 rounded-sm" />
      </div>
      <div className="h-px bg-slate-800 mb-1.5 shrink-0" />
      <div className="mb-1.5">
        <div className="h-0.5 w-16 bg-slate-700 rounded-sm mb-0.5" />
        <div className="h-px bg-slate-200 mb-0.5" />
        <div className="h-0.5 w-full bg-slate-200 rounded-sm mb-0.5" />
        <div className="h-0.5 w-5/6 bg-slate-200 rounded-sm mb-0.5" />
        <div className="h-0.5 w-3/4 bg-slate-200 rounded-sm" />
      </div>
      <div className="mb-1.5">
        <div className="h-0.5 w-20 bg-slate-700 rounded-sm mb-0.5" />
        <div className="h-px bg-slate-200 mb-0.5" />
        <div className="h-1 w-3/4 bg-slate-600 rounded-sm mb-0.5" />
        <div className="h-0.5 w-full bg-slate-200 rounded-sm mb-0.5" />
        <div className="h-0.5 w-5/6 bg-slate-200 rounded-sm mb-0.5" />
        <div className="h-0.5 w-4/5 bg-slate-200 rounded-sm" />
      </div>
      <div>
        <div className="h-0.5 w-14 bg-slate-700 rounded-sm mb-0.5" />
        <div className="h-px bg-slate-200 mb-0.5" />
        <div className="h-1 w-2/3 bg-slate-600 rounded-sm mb-0.5" />
        <div className="h-0.5 w-1/2 bg-slate-200 rounded-sm" />
      </div>
    </div>
  );
}

export function BoldChronologicalMiniPreview() {
  return (
    <div className="w-full aspect-[4/5] rounded-md border border-slate-200 overflow-hidden bg-white p-2 flex flex-col gap-1.5">
      <div className="flex flex-col items-center shrink-0">
        <div className="h-2.5 w-2/3 bg-slate-900 rounded-sm mb-0.5" />
        <div className="h-0.5 w-1/2 bg-slate-300 rounded-sm" />
      </div>
      <div className="h-[1.5px] bg-slate-900 shrink-0" />
      <div>
        <div className="h-0.5 w-1/4 bg-slate-700 rounded-sm mx-auto mb-0.5" />
        <div className="h-px bg-slate-800 mb-0.5" />
        <div className="h-0.5 w-full bg-slate-200 rounded-sm mb-0.5" />
        <div className="h-0.5 w-4/5 bg-slate-200 rounded-sm" />
      </div>
      <div>
        <div className="h-0.5 w-1/4 bg-slate-700 rounded-sm mx-auto mb-0.5" />
        <div className="h-px bg-slate-800 mb-0.5" />
        {[0, 1].map(i => (
          <div key={i} className="mb-1">
            <div className="flex justify-between mb-0.5">
              <div className="h-1 w-1/3 bg-slate-800 rounded-sm" />
              <div className="h-0.5 w-1/5 bg-slate-400 rounded-sm" />
            </div>
            <div className="h-0.5 w-full bg-slate-200 rounded-sm mb-0.5" />
            <div className="h-0.5 w-5/6 bg-slate-200 rounded-sm mb-0.5" />
            <div className="h-0.5 w-4/5 bg-slate-200 rounded-sm" />
          </div>
        ))}
      </div>
      <div>
        <div className="h-0.5 w-1/4 bg-slate-700 rounded-sm mx-auto mb-0.5" />
        <div className="h-px bg-slate-800 mb-0.5" />
        <div className="flex justify-between mb-0.5">
          <div className="h-1 w-1/3 bg-slate-800 rounded-sm" />
          <div className="h-0.5 w-1/5 bg-slate-400 rounded-sm" />
        </div>
        <div className="h-0.5 w-1/2 bg-slate-200 rounded-sm" />
      </div>
      <div>
        <div className="h-0.5 w-1/4 bg-slate-700 rounded-sm mx-auto mb-0.5" />
        <div className="h-px bg-slate-800 mb-0.5" />
        <div className="h-0.5 w-full bg-slate-300 rounded-sm" />
      </div>
    </div>
  );
}
