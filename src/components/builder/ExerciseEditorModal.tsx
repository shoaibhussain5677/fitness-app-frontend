import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Plus, AlertCircle, Save } from 'lucide-react';
import type { Exercise, Highlight } from '../../types';
import { generateId, EMOJIS } from '../../lib/utils';
import { FitnessAPI } from '../../services/fitnessApi';
// If you have ImageSearch in a separate file, import it, or define a simplified version here.
// Assuming we are keeping it self-contained for now based on your monolithic code:

function isVideoUrl(url: string) {
  if (!url) return false;
  return url.startsWith("data:video/") || url.includes(".mp4") || url.includes(".webm") || url.includes(".mov");
}

export function ExerciseEditorModal({ 
  initialData, 
  onSave, 
  onClose 
}: { 
  initialData?: Exercise, 
  onSave: (ex: Exercise) => void, 
  onClose: () => void 
}) {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [queryName, setQueryName] = useState(initialData?.name || "");
  const [highlights, setHighlights] = useState<Highlight[]>(initialData?.highlights || []);
  const [mediaError, setMediaError] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImage = (url: string) => { if (!images.includes(url)) setImages([...images, url]); };
  const removeImage = (idx: number) => { setImages(images.filter((_, i) => i !== idx)); };

  const handleAddUrl = () => {
    if (customUrl.trim() && !images.includes(customUrl.trim())) {
      setImages([...images, customUrl.trim()]);
      setCustomUrl("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMediaError("File is too large! Maximum allowed size is 5 MB.");
      return;
    }

    try {
      const url = await FitnessAPI.uploadFile(file);
      setImages(prev => [...prev, url]);
    } catch (err: any) {
      setMediaError(`Cloud upload failed: ${err.message}`);
    }
  };

  const addHighlight = () => setHighlights([...highlights, { id: generateId(), name: "", value: "", icon: "🎯" }]);
  const updateHighlight = (idx: number, field: string, val: string) => {
    const newH = [...highlights];
    newH[idx] = { ...newH[idx], [field]: val };
    setHighlights(newH);
  };
  const removeHighlight = (idx: number) => setHighlights(highlights.filter((_, i) => i !== idx));
  
  const inputClass = "w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm";
  const labelClass = "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      ...(initialData || { id: generateId(), isActive: true }),
      type: fd.get('type') as 'Workout' | 'Instruction',
      title: fd.get('title') as string,
      name: fd.get('name') as string,
      icon: fd.get('icon') as string,
      description: fd.get('description') as string,
      howTo: fd.get('howTo') as string,
      note: fd.get('note') as string,
      priority: fd.get('priority') === 'on',
      highlightLayout: fd.get('highlightLayout') as any || '3x1',
      highlights: highlights.filter(h => h.name && h.value),
      images
    });
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/60 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-card w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl border border-border">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/50 rounded-t-2xl">
          <h3 className="text-xl font-bold">{initialData?.id ? "Edit Exercise" : "New Exercise"}</h3>
          <button type="button" onClick={onClose} className="p-2 bg-muted rounded-full hover:bg-border transition-colors"><X size={16}/></button>
        </div>
        
        {/* Body */}
        <div className="p-4 overflow-y-auto hide-scrollbar">
          <form id="ex-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Type & Order */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className={labelClass}>Type</label>
                <select name="type" defaultValue={initialData?.type || 'Workout'} className={inputClass}>
                  <option value="Workout">Workout Lift</option>
                  <option value="Instruction">Instruction / Stretch</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-2">
                <label className={labelClass}>Order Title</label>
                <input name="title" defaultValue={initialData?.title} placeholder="e.g. Exercise 1" className={inputClass} required />
              </div>
            </div>
            
            {/* Name & Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Exercise Name</label>
                <input name="name" defaultValue={initialData?.name} onChange={e => setQueryName(e.target.value)} placeholder="e.g. Barbell Squat" className={inputClass} required />
              </div>
              <div className="sm:col-span-1">
                <label className={labelClass}>Icon (Emoji)</label>
                <select name="icon" defaultValue={initialData?.icon || ''} className={inputClass}>
                  <option value="">None</option>
                  {EMOJIS.map(e => <option key={e.char} value={e.char}>{e.char} {e.keywords.split(' ')[0]}</option>)}
                </select>
              </div>
            </div>
            
            {/* Media Elements (Matches your screenshot) */}
            <div className="border border-border rounded-xl p-4 bg-muted/30">
              <label className={labelClass}>Media Elements</label>
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4 mt-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  <Upload size={16}/> Upload File (&lt; 5MB)
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />
                
                <span className="text-xs font-bold text-muted-foreground uppercase">OR</span>
                
                <div className="flex w-full gap-2">
                  <input value={customUrl} onChange={e => setCustomUrl(e.target.value)} placeholder="Paste image/video URL..." className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  <button type="button" onClick={handleAddUrl} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors shrink-0">Add URL</button>
                </div>
              </div>

              {mediaError && (
                <div className="p-2 mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{mediaError}</span>
                </div>
              )}

              {/* Media Previews */}
              <div className="flex gap-2 overflow-x-auto mb-2 hide-scrollbar">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-border group bg-black/5">
                    {isVideoUrl(img) ? (
                      <video src={img} muted loop className="w-full h-full object-cover" />
                    ) : (
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                    )}
                    <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} className="text-white"/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Textareas */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>How To (Instructions)</label>
                <textarea name="howTo" defaultValue={initialData?.howTo} className={`${inputClass} min-h-[60px]`} placeholder="Form cues..." />
              </div>
              <div>
                <label className={labelClass}>Description / Notes</label>
                <textarea name="description" defaultValue={initialData?.description} className={`${inputClass} min-h-[60px]`} placeholder="Why are we doing this?" />
              </div>
              <div>
                <label className={labelClass}>Warning / Custom Note</label>
                <textarea name="note" defaultValue={initialData?.note} className={`${inputClass} min-h-[40px]`} placeholder="e.g. Do not skip this exercise!" />
              </div>
              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800/40">
                <input type="checkbox" name="priority" defaultChecked={initialData?.priority} className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500" />
                <label className="text-sm font-bold text-amber-800 dark:text-amber-300">Mark as Priority / Essential (⭐)</label>
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <label className={labelClass}>Highlights / Targets</label>
                <div className="flex items-center gap-3">
                  <select name="highlightLayout" defaultValue={initialData?.highlightLayout || '3x1'} className="text-xs font-bold text-muted-foreground bg-background border border-border rounded px-2 py-1 outline-none">
                    <option value="3x1">3 Columns</option>
                    <option value="1x2">2 Columns</option>
                    <option value="grid">Grid (Wrap)</option>
                  </select>
                  <button type="button" onClick={addHighlight} className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded hover:bg-orange-200 transition-colors flex items-center gap-1"><Plus size={14}/> Add</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {highlights.map((h, i) => (
                  <div key={h.id || i} className="relative space-y-2 bg-muted p-3 rounded-lg border border-border/50">
                    <button type="button" onClick={() => removeHighlight(i)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-500 hover:text-white transition-colors shadow-sm"><X size={12}/></button>
                    <select value={h.icon || ''} onChange={e => updateHighlight(i, 'icon', e.target.value)} className="w-full text-xs font-bold text-muted-foreground bg-background border border-border rounded px-2 py-1.5 outline-none mb-2">
                      <option value="">No Emoji</option>
                      {EMOJIS.map(e => <option key={e.char} value={e.char}>{e.char} {e.keywords.split(' ')[0]}</option>)}
                    </select>
                    <input value={h.name} onChange={e => updateHighlight(i, 'name', e.target.value)} placeholder="Title (e.g. Sets)" className={`${inputClass} text-xs py-1.5`} />
                    <input value={h.value} onChange={e => updateHighlight(i, 'value', e.target.value)} placeholder="Value (e.g. 3)" className={`${inputClass} text-xs font-bold py-1.5`} />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/50 rounded-b-2xl flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-muted-foreground hover:bg-border rounded-lg transition-colors">Cancel</button>
          <button type="submit" form="ex-form" className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 shadow-sm transition-colors flex items-center gap-2"><Save size={16}/> Save Exercise</button>
        </div>

      </div>
    </div>
  );
}