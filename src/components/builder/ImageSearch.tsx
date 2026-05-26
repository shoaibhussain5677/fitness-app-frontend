import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, Plus } from 'lucide-react';

export function ImageSearch({ currentName, onSelectImage }: { currentName: string, onSelectImage: (url: string) => void }) {
  const [query, setQuery] = useState(currentName || "");
  const [results, setResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [sourceUsed, setSourceUsed] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError("");
    setResults([]);
    setSourceUsed("");
    
    let foundImages: string[] = [];

    // Rich Fallback Mapping
    const fallbackMap: Record<string, string[]> = {
       "squat": ["https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-goblet-squat.jpg", "https://fitnessprogramer.com/wp-content/uploads/2023/01/Dumbbell-Goblet-Squat.gif"],
       "press": ["https://training.fit/wp-content/uploads/2020/02/schraegbankdruecken-maschine.png", "https://workoutlabs.com/fit/pin-ex/cache-png/4278-m.png"],
       "row": ["https://weighttraining.guide/wp-content/uploads/2016/10/bent-over-one-arm-dumbbell-row-resized.png", "https://fitnessprogramer.com/wp-content/uploads/2021/06/Seated-Cable-Rope-Row.gif"],
       "curl": ["https://cdn.shopify.com/s/files/1/1497/9682/files/2_dd805047-4f47-4ebf-ad7b-3336dd3b69d2.jpg?v=1658851624", "https://liftmanual.com/wp-content/uploads/2023/04/lever-lying-leg-curl.jpg"],
       "lunge": ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKCtGPeOeHa1PbrhhubQOibdO2x20mTqEiqw&s", "https://workoutlabs.com/fit/pin-ex/cache-png/1964-m.png"],
       "plank": ["https://liftmanual.com/wp-content/uploads/2023/04/front-plank-with-twist.jpg", "https://liftmanual.com/wp-content/uploads/2023/04/front-plank.jpg"],
       "stretch": ["https://liftmanual.com/wp-content/uploads/2023/04/cat-cow-stretch.jpg", "https://liftmanual.com/wp-content/uploads/2023/04/kneeling-hip-flexor-stretch.jpg"],
       "bench": ["https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Chest-Press-Machine.gif", "https://training.fit/wp-content/uploads/2020/02/schraegbankdruecken-maschine.png"],
       "calf": ["https://cdn.shopify.com/s/files/1/2350/9323/files/Muscles_Worked_by_the_Smith_Machine_Calf_Raise.jpg?v=1766484243"],
       "pull": ["https://liftmanual.com/wp-content/uploads/2023/04/cable-standing-face-pull.jpg", "https://weighttraining.guide/wp-content/uploads/2016/05/wide-grip-lat-pull-down-resized.png"]
    };

    const applyFallback = (msg: string) => {
       const lowerQ = query.toLowerCase();
       for (const key in fallbackMap) {
         if (lowerQ.includes(key)) {
           setResults(fallbackMap[key]);
           setError(`${msg} Loaded local presets.`);
           setSourceUsed("Local Presets");
           return;
         }
       }
       setError(`${msg} No local presets match either.`);
    };

    const fetchJsonWithProxyFallback = async (targetUrl: string) => {
      const fetchWithTimeout = async (url: string) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 4000);
        try {
          const res = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
          clearTimeout(id);
          if (res.ok) return await res.json();
          throw new Error("Bad status");
        } catch(e) {
          clearTimeout(id);
          throw e;
        }
      };

      try {
        return await fetchWithTimeout(targetUrl);
      } catch (directErr) {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        return await fetchWithTimeout(proxyUrl);
      }
    };

    // SOURCE 1: Yuhonas / free-exercise-db
    try {
      const yuhonasUrl = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
      const data = await fetchJsonWithProxyFallback(yuhonasUrl);
      if (Array.isArray(data)) {
        const matches = data.filter((ex: any) => ex.name?.toLowerCase().includes(query.toLowerCase()));
        matches.forEach((ex: any) => {
          if (Array.isArray(ex.images)) {
            ex.images.forEach((img: string) => {
              foundImages.push(img.startsWith('http') ? img : `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`);
            });
          } else if (ex.gifUrl) {
            foundImages.push(ex.gifUrl.startsWith('http') ? ex.gifUrl : `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ex.gifUrl}`);
          }
        });
      }
      if (foundImages.length > 0) setSourceUsed("Yuhonas DB");
    } catch (e) {
      console.warn("Yuhonas fallback failed", e);
    }

    // SOURCE 2: Wger Project
    if (foundImages.length === 0) {
      try {
        const searchUrl = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(query)}`;
        const data = await fetchJsonWithProxyFallback(searchUrl);
        
        if (data.suggestions && data.suggestions.length > 0) {
          const topExercises = data.suggestions.slice(0, 4);
          
          for (const ex of topExercises) {
            if (ex.data && ex.data.image) {
              const url = ex.data.image.startsWith('http') ? ex.data.image : `https://wger.de${ex.data.image}`;
              foundImages.push(url);
            }
            if (ex.data && ex.data.base_id) {
              try {
                const imageApiUrl = `https://wger.de/api/v2/exerciseimage/?exercise_base=${ex.data.base_id}`;
                const imgData = await fetchJsonWithProxyFallback(imageApiUrl);
                if (imgData.results && imgData.results.length > 0) {
                  imgData.results.forEach((r: any) => {
                    if (r.image) {
                      const url = r.image.startsWith('http') ? r.image : `https://wger.de${r.image}`;
                      foundImages.push(url);
                    }
                  });
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }
        if (foundImages.length > 0) setSourceUsed("Wger Project API");
      } catch (err: any) {
        console.warn("Wger fallback failed", err);
      }
    }

    // SOURCE 3: Wrkout
    if (foundImages.length === 0) {
      try {
        const wrkoutUrl = "https://raw.githubusercontent.com/wrkout/exercises.json/main/exercises.json";
        const data = await fetchJsonWithProxyFallback(wrkoutUrl);
        if (Array.isArray(data)) {
           const matches = data.filter((ex: any) => ex.name?.toLowerCase().includes(query.toLowerCase()) || ex.title?.toLowerCase().includes(query.toLowerCase()));
           matches.forEach((ex: any) => {
              if (ex.image) foundImages.push(ex.image);
              if (ex.gifUrl) foundImages.push(ex.gifUrl);
              if (ex.url && ex.url.match(/\.(jpeg|jpg|gif|png)$/i)) foundImages.push(ex.url);
              if (Array.isArray(ex.images)) foundImages.push(...ex.images);
           });
        }
        if (foundImages.length > 0) setSourceUsed("Wrkout Data");
      } catch(e) {
        console.warn("Wrkout fallback failed", e);
      }
    }

    // Consolidate & Finalize
    const uniqueImages = Array.from(new Set(foundImages));
    
    if (uniqueImages.length > 0) {
      setResults(uniqueImages);
    } else {
      applyFallback("All 3 remote APIs failed or returned no matches.");
    }
    
    setIsSearching(false);
  };

  return (
    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 mt-4 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold text-blue-800 dark:text-blue-300">Search Image Database</label>
        {sourceUsed && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">Source: {sourceUsed}</span>}
      </div>
      <div className="flex gap-2 mb-3">
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="e.g. Squat" className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <button type="button" onClick={handleSearch} disabled={isSearching} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm">
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Search
        </button>
      </div>
      
      {error && (
        <div className="flex items-center gap-1.5 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg text-xs text-yellow-800 dark:text-yellow-400 font-semibold mb-3 border border-yellow-200/40">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto hide-scrollbar p-1">
          {results.map((url, i) => (
            <button type="button" key={i} onClick={() => onSelectImage(url)} className="relative aspect-square bg-muted rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all focus:outline-none group shadow-sm">
              <img src={url} alt="Result" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-blue-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={24} className="text-white" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}