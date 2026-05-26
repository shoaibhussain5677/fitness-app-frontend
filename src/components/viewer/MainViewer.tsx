import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Settings, ListTodo, BarChart2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ViewerActivity } from './ViewerActivity';
import { ViewerIndependentItem } from './ViewerIndependentItem';
import { WorkoutTracker } from '../tracker/WorkoutTracker';

export function MainViewer() {
  const { phases, setViewMode } = useAppContext();
  const { isDarkMode, toggleTheme } = useTheme(); // Adapted to modular theme context
  
  // Kept as local state to perfectly match your logic
  const [activeTab, setActiveTab] = useState<'plan' | 'tracker'>('plan');
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openPhase, setOpenPhase] = useState(phases[0]?.id || "");

  // Restore your custom Scroll-Spy Logic
  useEffect(() => {
    if (activeTab !== 'plan') return;
    const handleScroll = () => {
      const allIds: string[] = [];
      phases.forEach(p => p.isActive && p.items.forEach(i => {
        if (i.nodeType === 'Activity' && i.data.isActive) allIds.push(i.data.id);
        if (i.nodeType === 'IndependentItem' && i.data.isActive) allIds.push(i.data.id);
      }));
      const sections = allIds.map(id => document.getElementById(id)).filter(Boolean);
      const current = sections.findLast(el => el && el.getBoundingClientRect().top <= 140);
      if (current) setActiveId(current.id);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [phases, activeTab]);

  const scrollTo = (id: string) => {
    if(activeTab !== 'plan') setActiveTab('plan');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) { 
        const yOffset = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: yOffset, behavior: "smooth" }); 
        setMobileOpen(false); 
      }
    }, 100);
  };

  // Restore your precise Sidebar JSX
  const sidebarJSX = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-6 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md">SW</div>
          <div className="min-w-0">
            <p className="font-extrabold text-lg leading-tight tracking-tight">Shoaib's Workout</p>
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mt-0.5">12-Week Plan</p>
          </div>
        </div>
      </div>

      <div className="px-3 pt-4 pb-2 border-b border-sidebar-border flex gap-2">
         <button onClick={() => setActiveTab('plan')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'plan' ? 'bg-orange-500 text-white shadow-sm' : 'bg-sidebar-accent text-sidebar-foreground hover:bg-border'}`}><ListTodo size={16}/> Plan</button>
         <button onClick={() => setActiveTab('tracker')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'tracker' ? 'bg-orange-500 text-white shadow-sm' : 'bg-sidebar-accent text-sidebar-foreground hover:bg-border'}`}><BarChart2 size={16}/> Tracker</button>
      </div>

      {activeTab === 'plan' ? (
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {phases.filter(p => p.isActive).map(phase => {
            const isWip = phase.items.length === 0;
            return (
              <div key={phase.id} className="flex flex-col">
                <button onClick={() => !isWip && setOpenPhase(openPhase === phase.id ? "" : phase.id)} className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all text-left ${isWip ? 'opacity-60 cursor-default' : 'hover:bg-sidebar-accent cursor-pointer'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span><span className="font-bold text-base leading-tight">{phase.title}</span>
                  </div>
                  {!isWip && openPhase === phase.id && <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>}
                  {isWip && <span className="text-[10px] font-bold uppercase tracking-wider bg-sidebar-border px-2 py-1 rounded-md">WIP</span>}
                </button>
                {openPhase === phase.id && !isWip && (
                  <div className="mt-2 ml-7 pl-4 border-l-2 border-sidebar-border space-y-1">
                    {phase.items.map(item => {
                      if (!item.data.isActive) return null;
                      const id = item.data.id;
                      const label = item.nodeType === 'Activity' ? `${item.data.title} - ${item.data.name}` : item.data.title || "Item";
                      const icon = item.nodeType === 'Activity' ? item.data.icon : (item.data.icon || "📌");
                      return (
                        <button key={id} onClick={() => scrollTo(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${activeId === id ? "bg-orange-500 text-white shadow-sm" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
                          <span className="text-base">{icon}</span><span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      ) : (
        <div className="flex-1 overflow-y-auto py-5 px-5 opacity-60">
           <p className="text-sm font-bold mb-2">Workout Tracker</p>
           <p className="text-xs leading-relaxed">Manage your logged activities and view past completion reports from the main area.</p>
        </div>
      )}

      <div className="flex-shrink-0 border-t border-sidebar-border p-4 flex justify-between items-center">
        <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-border transition-colors shadow-sm" title="Toggle Light/Dark Mode">
          {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
        </button>
        <button onClick={() => setViewMode('builder')} className="flex items-center gap-2 px-3 py-2 bg-sidebar-accent hover:bg-sidebar-border rounded-lg text-xs font-bold uppercase tracking-wider text-sidebar-foreground transition-colors">
          <Settings size={14} /> Plan Builder
        </button>
      </div>
    </div>
  );

  const activePhaseData = phases.find(p => p.id === openPhase);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border flex-col z-40 shadow-lg">
        {sidebarJSX}
      </aside>
      
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">SW</div>
            <span className="font-extrabold text-sidebar-foreground text-base tracking-tight">Shoaib's Workout</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="w-10 h-10 flex items-center justify-center rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 bottom-0 w-72 bg-sidebar shadow-2xl border-r border-sidebar-border">
            {sidebarJSX}
          </div>
        </div>
      )}

      <div className="lg:ml-72 pb-24">
        {activeTab === 'plan' ? (
          <>
            <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-orange-950 text-white pt-32 lg:pt-24 pb-16 px-6">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4 tracking-tight">
                  Shoaib's<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Workout Plan</span>
                </h1>
                <p className="text-gray-300 text-lg md:text-xl font-medium max-w-xl mx-auto">{activePhaseData?.title || "Select a phase"}</p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12 space-y-16">
              {activePhaseData?.items.map(node => {
                if (!node.data.isActive) return null;
                if (node.nodeType === 'IndependentItem') {
                  return <ViewerIndependentItem key={node.data.id} item={node.data} />;
                }
                if (node.nodeType === 'Activity') {
                  return <ViewerActivity key={node.data.id} activity={node.data} />;
                }
                return null;
              })}
            </div>
          </>
        ) : (
          <WorkoutTracker />
        )}
      </div>
    </div>
  );
}