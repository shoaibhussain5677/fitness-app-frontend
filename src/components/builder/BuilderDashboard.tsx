import React, { useState, useRef, useEffect } from 'react';
import { Settings, Download, Upload, Home, Plus, Edit2, Trash2, MoveUp, MoveDown, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import type { Phase, Activity, Exercise, IndependentItem, ActivityNode } from '../../types';
import { generateId, EMOJIS } from '../../lib/utils';
import { BaseModal } from '../common/BaseModal';
import { ExerciseEditorModal } from './ExerciseEditorModal';
import { FitnessAPI } from '../../services/fitnessApi';

type ModalConfig = 
  | { type: 'Phase', data?: Phase }
  | { type: 'Activity', phaseId: string, data?: Activity }
  | { type: 'Exercise', phaseId: string, activityId: string, data?: Exercise }
  | { type: 'IndependentItem', phaseId: string, activityId: string, data?: IndependentItem }
  | null;

export function BuilderDashboard() {
  const { phases, setPhases, setViewMode } = useAppContext();
  const [activePhaseId, setActivePhaseId] = useState<string>(phases[0]?.id || "");
  const [modalConfig, setModalConfig] = useState<ModalConfig>(null);
  
  useEffect(() => {
    if (!phases.find(p => p.id === activePhaseId) && phases.length > 0) {
      setActivePhaseId(phases[0].id);
    }
  }, [phases, activePhaseId]);

  const inputClass = "w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-shadow";
  const labelClass = "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1";

  const moveArrayItem = (array: any[], index: number, dir: number) => {
    const newArr = [...array];
    if (index + dir >= 0 && index + dir < newArr.length) {
      [newArr[index], newArr[index + dir]] = [newArr[index + dir], newArr[index]];
    }
    return newArr;
  };

  const deleteNode = (phaseId: string, activityId?: string, itemId?: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setPhases(prev => {
      if (!activityId) return prev.filter(p => p.id !== phaseId);
      return prev.map(p => {
        if (p.id !== phaseId) return p;
        if (!itemId) return { ...p, items: p.items.filter(i => i.nodeType !== 'Activity' || i.data.id !== activityId) };
        return {
          ...p,
          items: p.items.map(act => {
            if (act.nodeType !== 'Activity' || act.data.id !== activityId) return act;
            return { ...act, data: { ...act.data, items: act.data.items.filter(i => i.data.id !== itemId) } };
          })
        };
      });
    });
  };

  const savePhase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (modalConfig?.type !== 'Phase') return;
    const title = (new FormData(e.currentTarget).get('title') as string) || 'New Phase';
    if (modalConfig.data?.id) {
      setPhases(prev => prev.map(p => p.id === modalConfig.data!.id ? { ...p, title } : p));
    } else {
      const newId = generateId();
      setPhases(prev => [...prev, { id: newId, title, items: [], isActive: true }]);
      setActivePhaseId(newId);
    }
    setModalConfig(null);
  };

  const saveActivity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (modalConfig?.type !== 'Activity') return;
    const fd = new FormData(e.currentTarget);
    const actData: Activity = {
      ...(modalConfig.data || { id: generateId(), items: [], isActive: true }),
      title: fd.get('title') as string,
      name: fd.get('name') as string,
      overview: fd.get('overview') as string,
      description: fd.get('description') as string,
      icon: fd.get('icon') as string || '🎯',
      colorTheme: fd.get('colorTheme') as string,
      targetSessions: parseInt(fd.get('targetSessions') as string) || 0,
    };
    setPhases(prev => prev.map(p => {
      if (p.id === modalConfig.phaseId) {
        const exists = p.items.find(i => i.nodeType === 'Activity' && i.data.id === actData.id);
        const newItems = exists 
          ? p.items.map(i => i.data.id === actData.id ? { ...i, data: actData } : i) 
          : [...p.items, { nodeType: 'Activity', data: actData }];
        return { ...p, items: newItems };
      }
      return p;
    }));
    setModalConfig(null);
  };

  const saveIndependent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (modalConfig?.type !== 'IndependentItem') return;
    const fd = new FormData(e.currentTarget);
    const indData: IndependentItem = {
      ...(modalConfig.data || { id: generateId(), isActive: true }),
      type: fd.get('type') as 'Header' | 'Note' | 'Highlights',
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      icon: fd.get('icon') as string,
      color: fd.get('color') as string,
    };
    updateActivityNode(modalConfig.phaseId, modalConfig.activityId, { nodeType: 'IndependentItem', data: indData });
  };

  const saveExercise = (exData: Exercise) => {
    if (modalConfig?.type !== 'Exercise') return;
    updateActivityNode(modalConfig.phaseId, modalConfig.activityId, { nodeType: 'Exercise', data: exData });
  };

  const updateActivityNode = (phaseId: string, activityId: string, node: ActivityNode) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== phaseId) return p;
      return {
        ...p,
        items: p.items.map(act => {
          if (act.nodeType !== 'Activity' || act.data.id !== activityId) return act;
          const exists = act.data.items.find(i => i.data.id === node.data.id);
          const newItems = exists 
            ? act.data.items.map(i => i.data.id === node.data.id ? node : i) 
            : [...act.data.items, node];
          return { ...act, data: { ...act.data, items: newItems } };
        })
      };
    }));
    setModalConfig(null);
  };

  const activePhase = phases.find(p => p.id === activePhaseId);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 animate-in fade-in">
      
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="text-orange-500" size={24} />
            <h1 className="font-black text-xl tracking-tight hidden sm:block">Plan Builder</h1>
          </div>
          <button onClick={() => setViewMode('app')} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 text-sm">
            <Home size={16} /> Exit Builder
          </button>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-2 overflow-x-auto hide-scrollbar py-3">
          {phases.map(p => (
            <button key={p.id} onClick={() => setActivePhaseId(p.id)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activePhaseId === p.id ? 'bg-orange-500 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-border'}`}>
              {p.title}
            </button>
          ))}
          <button onClick={() => setModalConfig({ type: 'Phase' })} className="whitespace-nowrap px-4 py-2 bg-sidebar-accent hover:bg-border text-foreground rounded-lg text-sm font-bold transition-colors flex items-center gap-1">
            <Plus size={16}/> Add Phase
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 mt-4">
        {activePhase ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted p-4 rounded-xl border border-border">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Phase</p>
                <h2 className="text-2xl font-bold">{activePhase.title}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModalConfig({ type: 'Phase', data: activePhase })} className="p-2 bg-card hover:bg-border rounded-lg transition-colors"><Edit2 size={16}/></button>
                <button onClick={() => deleteNode(activePhase.id)} className="p-2 bg-card hover:bg-red-100 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>

            {/* Activities Rendering */}
            {activePhase.items.map((node, actIdx) => {
              if (node.nodeType !== 'Activity') return null;
              const act = node.data;
              return (
                <div key={act.id} className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-sm">
                  
                  {/* Activity Header */}
                  <div className="bg-muted p-4 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl bg-background p-2 rounded-xl shadow-sm">{act.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{act.name}</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{act.title}</p>
                      </div>
                    </div>
                    
                    {/* Activity Controls */}
                    <div className="flex gap-1 bg-background p-1 rounded-lg border border-border shadow-sm">
                      <button onClick={() => setPhases(prev => prev.map(p => p.id === activePhase.id ? { ...p, items: moveArrayItem(p.items, actIdx, -1) } : p))} disabled={actIdx === 0} className="p-1.5 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"><MoveUp size={16}/></button>
                      <button onClick={() => setPhases(prev => prev.map(p => p.id === activePhase.id ? { ...p, items: moveArrayItem(p.items, actIdx, 1) } : p))} disabled={actIdx === activePhase.items.length - 1} className="p-1.5 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"><MoveDown size={16}/></button>
                      <div className="w-px h-4 bg-border mx-1 my-auto"></div>
                      <button onClick={() => setModalConfig({ type: 'Activity', phaseId: activePhase.id, data: act })} className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Edit2 size={16}/></button>
                      <button onClick={() => deleteNode(activePhase.id, act.id)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-muted-foreground transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </div>

                  {/* Activity Items (Exercises & Notes) */}
                  <div className="p-4 space-y-3">
                    {act.items.length === 0 && <p className="text-muted-foreground text-sm italic text-center py-4">No exercises or items added yet.</p>}
                    
                    {act.items.map((subItem, itemIdx) => (
                      <div key={subItem.data.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl group hover:border-orange-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xl bg-muted p-1.5 rounded-lg">{subItem.nodeType === 'Exercise' ? (subItem.data as Exercise).type === 'Workout' ? '🏋️' : '📝' : (subItem.data as IndependentItem).icon || '📌'}</span>
                          <div>
                            <p className="font-bold text-sm leading-tight">{subItem.data.title || subItem.nodeType}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px] sm:max-w-md">{subItem.nodeType === 'Exercise' ? (subItem.data as Exercise).name : (subItem.data as IndependentItem).description}</p>
                          </div>
                        </div>
                        
                        {/* Sub-Item Controls */}
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => setPhases(prev => prev.map(p => p.id === activePhase.id ? { ...p, items: p.items.map(a => a.nodeType === 'Activity' && a.data.id === act.id ? { ...a, data: { ...a.data, items: moveArrayItem(a.data.items, itemIdx, -1) } } : a) } : p))} disabled={itemIdx === 0} className="p-1.5 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"><MoveUp size={14}/></button>
                          <button onClick={() => setPhases(prev => prev.map(p => p.id === activePhase.id ? { ...p, items: p.items.map(a => a.nodeType === 'Activity' && a.data.id === act.id ? { ...a, data: { ...a.data, items: moveArrayItem(a.data.items, itemIdx, 1) } } : a) } : p))} disabled={itemIdx === act.items.length - 1} className="p-1.5 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"><MoveDown size={14}/></button>
                          <button onClick={() => setModalConfig({ type: subItem.nodeType as 'Exercise'|'IndependentItem', phaseId: activePhase.id, activityId: act.id, data: subItem.data as any })} className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Edit2 size={14}/></button>
                          <button onClick={() => deleteNode(activePhase.id, act.id, subItem.data.id)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-muted-foreground transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
                      <button onClick={() => setModalConfig({ type: 'Exercise', phaseId: activePhase.id, activityId: act.id })} className="py-2 bg-orange-50 dark:bg-orange-900/10 text-orange-600 border border-orange-200 dark:border-orange-800/40 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors flex items-center justify-center gap-1"><Plus size={14}/> Exercise</button>
                      <button onClick={() => setModalConfig({ type: 'IndependentItem', phaseId: activePhase.id, activityId: act.id, data: { type: 'Note', id: '', isActive: true } })} className="py-2 bg-blue-50 dark:bg-blue-900/10 text-blue-600 border border-blue-200 dark:border-blue-800/40 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"><Plus size={14}/> Note</button>
                      <button onClick={() => setModalConfig({ type: 'IndependentItem', phaseId: activePhase.id, activityId: act.id, data: { type: 'Header', id: '', isActive: true } })} className="py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"><Plus size={14}/> Header</button>
                    </div>
                  </div>
                </div>
              );
            })}

            <button onClick={() => setModalConfig({ type: 'Activity', phaseId: activePhase.id })} className="w-full py-4 border-2 border-dashed border-border rounded-xl text-sm font-bold text-muted-foreground hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all flex items-center justify-center gap-2">
              <Plus size={18}/> Add Activity to {activePhase.title}
            </button>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>No phases found. Create your first phase to start building!</p>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {modalConfig?.type === 'Phase' && (
        <BaseModal title={modalConfig.data?.id ? "Edit Phase" : "New Phase"} onClose={() => setModalConfig(null)}>
          <form onSubmit={savePhase} className="space-y-4">
            <div>
              <label className={labelClass}>Phase Title</label>
              <input name="title" defaultValue={modalConfig.data?.title} placeholder="e.g. Weeks 1-4: Foundation" className={inputClass} autoFocus required />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" onClick={() => setModalConfig(null)} className="px-4 py-2 font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 shadow-sm transition-colors">Save</button>
            </div>
          </form>
        </BaseModal>
      )}

      {modalConfig?.type === 'Activity' && (
        <BaseModal title={modalConfig.data?.id ? "Edit Activity" : "New Activity"} onClose={() => setModalConfig(null)}>
          <form onSubmit={saveActivity} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Activity Name</label>
                <input name="name" defaultValue={modalConfig.data?.name} placeholder="e.g. THE UPPER WORKOUT" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Subtitle / Schedule</label>
                <input name="title" defaultValue={modalConfig.data?.title} placeholder="e.g. Day 1 & 6" className={inputClass} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Overview Outline</label>
              <input name="overview" defaultValue={modalConfig.data?.overview} placeholder="e.g. Chest · Back · Shoulders" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea name="description" defaultValue={modalConfig.data?.description} placeholder="Goal or description of this block..." className={`${inputClass} min-h-[80px] resize-y`} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Icon</label>
                <select name="icon" defaultValue={modalConfig.data?.icon || '🎯'} className={inputClass}>
                  {EMOJIS.map(e => <option key={e.char} value={e.char}>{e.char} {e.keywords.split(' ')[0]}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Target Sessions</label>
                <input name="targetSessions" type="number" defaultValue={modalConfig.data?.targetSessions || 0} className={inputClass} min="0" />
              </div>
              <div>
                <label className={labelClass}>Color Theme</label>
                <select name="colorTheme" defaultValue={modalConfig.data?.colorTheme || 'orange'} className={inputClass}>
                  <option value="orange">Orange</option>
                  <option value="blue">Blue</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" onClick={() => setModalConfig(null)} className="px-4 py-2 font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 shadow-sm transition-colors">Save</button>
            </div>
          </form>
        </BaseModal>
      )}

      {modalConfig?.type === 'IndependentItem' && (
        <BaseModal title={modalConfig.data?.id ? "Edit Item" : "New Item"} onClose={() => setModalConfig(null)}>
          <form onSubmit={saveIndependent} className="space-y-4">
            <div>
              <label className={labelClass}>Item Type</label>
              <select name="type" defaultValue={modalConfig.data?.type || 'Note'} className={inputClass}>
                <option value="Note">Note Card</option>
                <option value="Header">Section Header</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Title (Optional)</label>
              <input name="title" defaultValue={modalConfig.data?.title} placeholder="e.g. 💡 Warm-up Protocol" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description / Content</label>
              <textarea name="description" defaultValue={modalConfig.data?.description} className={`${inputClass} min-h-[100px]`} placeholder="Content details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Icon Emoji</label>
                <input name="icon" defaultValue={modalConfig.data?.icon || '💡'} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Color Theme</label>
                <select name="color" defaultValue={modalConfig.data?.color || 'orange'} className={inputClass}>
                  <option value="orange">Orange</option>
                  <option value="blue">Blue</option>
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" onClick={() => setModalConfig(null)} className="px-4 py-2 font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 shadow-sm transition-colors">Save Item</button>
            </div>
          </form>
        </BaseModal>
      )}

      {modalConfig?.type === 'Exercise' && (
        <ExerciseEditorModal 
          initialData={modalConfig.data} 
          onSave={saveExercise} 
          onClose={() => setModalConfig(null)} 
        />
      )}
    </div>
  );
}