import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Play, CheckCircle2, XCircle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import type { Activity, WorkoutLog } from '../../types';
import { getLocalISODate, generateId, themeColors } from '../../lib/utils';

export function WorkoutTracker() {
  const { phases, workoutLogs, setWorkoutLogs, activeWorkout, setActiveWorkout } = useAppContext();
  const [view, setView] = useState<'4day' | 'week' | 'month' | 'year'>('4day');
  const [baseDate, setBaseDate] = useState(new Date());
  const [logModalDate, setLogModalDate] = useState<string | null>(null);
  const [reportLog, setReportLog] = useState<WorkoutLog | null>(null);

  const todayStr = getLocalISODate(new Date());

  const getDaysArray = (v: typeof view, date: Date) => {
    const arr = [];
    if (v === '4day') {
      for (let i = 0; i < 4; i++) {
        const d = new Date(date); d.setDate(d.getDate() + i); arr.push(d);
      }
    } else if (v === 'week') {
      const start = new Date(date);
      start.setDate(start.getDate() - start.getDay());
      for (let i = 0; i < 7; i++) {
        const d = new Date(start); d.setDate(d.getDate() + i); arr.push(d);
      }
    } else if (v === 'month') {
      const y = date.getFullYear(), m = date.getMonth();
      const firstDay = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      for(let i=0; i<firstDay; i++) { const d = new Date(y, m, 0 - (firstDay - 1 - i)); arr.push(d); }
      for(let i=1; i<=daysInMonth; i++) { arr.push(new Date(y, m, i)); }
      const remaining = 42 - arr.length;
      for(let i=1; i<=remaining; i++) { arr.push(new Date(y, m + 1, i)); }
    }
    return arr;
  };

  const navDate = (dir: 1 | -1) => {
    const d = new Date(baseDate);
    if (view === '4day') d.setDate(d.getDate() + dir * 4);
    if (view === 'week') d.setDate(d.getDate() + dir * 7);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    if (view === 'year') d.setFullYear(d.getFullYear() + dir);
    setBaseDate(d);
  };

  const days = getDaysArray(view, baseDate);
  const months = Array.from({length: 12}, (_, i) => new Date(baseDate.getFullYear(), i, 1));

  const getActivityById = (id: string) => {
    for (const p of phases) {
      for (const item of p.items) {
        if (item.nodeType === 'Activity' && item.data.id === id) return item.data as Activity;
      }
    }
    return null;
  };

  const handleDayClick = (dateStr: string) => {
    if (dateStr > todayStr) return; // Cannot log future
    setLogModalDate(dateStr);
  };

  const selectActivityToLog = (act: Activity) => {
    if (!logModalDate) return;
    if (logModalDate === todayStr) {
      if (activeWorkout) {
        if (confirm("End current workout and start new one?")) {
           setActiveWorkout({ activityId: act.id, dateStarted: todayStr, completedExerciseIds: [], skippedExerciseIds: [], isMinimized: false });
        }
      } else {
        setActiveWorkout({ activityId: act.id, dateStarted: todayStr, completedExerciseIds: [], skippedExerciseIds: [], isMinimized: false });
      }
    } else {
      const allEx = act.items.filter(i => i.nodeType === 'Exercise').map(i => i.data.id);
      setWorkoutLogs([...workoutLogs, { id: generateId(), activityId: act.id, date: logModalDate, completedExercises: allEx, skippedExercises: [], sessionValue: 1 }]);
    }
    setLogModalDate(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold flex items-center gap-3"><Calendar size={28} /> Workout Tracker</h2>
          <p className="text-muted-foreground mt-1">Log, track, and review your progress</p>
        </div>
        <div className="flex items-center gap-2 bg-card p-1 rounded-xl shadow-sm border border-border">
          {['4day', 'week', 'month', 'year'].map(v => (
            <button key={v} onClick={() => setView(v as any)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${view === v ? 'bg-orange-500 text-white' : 'text-muted-foreground hover:text-foreground'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={() => navDate(-1)} className="p-2 hover:bg-muted rounded-lg"><ChevronLeft/></button>
            <button onClick={() => setBaseDate(new Date())} className="px-3 py-1.5 font-bold bg-muted hover:bg-border rounded-lg text-sm transition-colors">Today</button>
            <button onClick={() => navDate(1)} className="p-2 hover:bg-muted rounded-lg"><ChevronRight/></button>
          </div>
          <h3 className="text-xl font-bold">
            {view === 'year' ? baseDate.getFullYear() : baseDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        {view === 'year' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
             {months.map((m, i) => {
               const mStr = getLocalISODate(m).substring(0,7);
               const logsInMonth = workoutLogs.filter(l => l.date.startsWith(mStr));
               return (
                 <div key={i} className="border border-border rounded-xl p-4 flex flex-col items-center justify-center hover:border-orange-500 cursor-pointer transition-colors" onClick={() => {setBaseDate(m); setView('month');}}>
                   <span className="font-bold text-lg mb-1">{m.toLocaleString('default', {month:'short'})}</span>
                   <span className="text-xs font-bold bg-muted px-2 py-1 rounded-md text-orange-600">{logsInMonth.length} workouts</span>
                 </div>
               )
             })}
          </div>
        ) : (
          <div className="grid gap-px bg-border/50 border border-border/50 rounded-xl overflow-hidden" 
               style={{ gridTemplateColumns: `repeat(${view === '4day' ? 4 : 7}, minmax(0, 1fr))` }}>
            {days.slice(0, view === '4day' ? 4 : 7).map((d, i) => (
              <div key={i} className="bg-muted p-2 text-center text-xs font-bold text-muted-foreground uppercase">
                {d.toLocaleString('default', { weekday: 'short' })}
              </div>
            ))}
            {days.map((d, i) => {
              const dStr = getLocalISODate(d);
              const isToday = dStr === todayStr;
              const isFuture = dStr > todayStr;
              const isCurrentMonth = view !== 'month' || d.getMonth() === baseDate.getMonth();
              const logs = workoutLogs.filter(l => l.date === dStr);

              return (
                <div key={i} onClick={() => !isFuture && handleDayClick(dStr)} className={`min-h-[100px] p-2 flex flex-col gap-1 transition-colors bg-card
                  ${!isCurrentMonth ? 'opacity-40 bg-muted/30' : ''}
                  ${isToday ? 'ring-2 ring-inset ring-orange-500 bg-orange-50/10 dark:bg-orange-900/10' : ''}
                  ${!isFuture ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-not-allowed opacity-60'}
                `}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-orange-500 text-white' : ''}`}>
                      {d.getDate()}
                    </span>
                    {!isFuture && <span className="text-[10px] text-muted-foreground opacity-0 hover:opacity-100">+Add</span>}
                  </div>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] hide-scrollbar">
                    {logs.map(log => {
                      const act = getActivityById(log.activityId);
                      if(!act) return null;
                      const c = themeColors[act.colorTheme] || themeColors.orange;
                      return (
                        <div key={log.id} onClick={(e) => {e.stopPropagation(); setReportLog(log);}} className={`text-[10px] sm:text-xs font-bold px-1.5 py-1 rounded border shadow-sm truncate flex items-center gap-1 ${c.bg} ${c.text} ${c.border} hover:opacity-80 transition-opacity`}>
                          <span>{act.icon}</span> <span className="truncate">{act.name}</span>
                          {log.sessionValue < 1 && <span className="ml-auto opacity-70">({log.sessionValue})</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {logModalDate && (
        <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-card w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-6 shadow-xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold">Log Activity</h3>
                <p className="text-sm text-muted-foreground">{logModalDate === todayStr ? "Start a workout for today" : `Retroactive log for ${logModalDate}`}</p>
              </div>
              <button onClick={() => setLogModalDate(null)} className="p-2 bg-muted rounded-full hover:bg-border"><X size={16}/></button>
            </div>
            
            <div className="space-y-6">
              {phases.filter(p => p.isActive).map(phase => {
                const activities = phase.items.filter(i => i.nodeType === 'Activity' && i.data.isActive).map(i => i.data as Activity);
                if (activities.length === 0) return null;
                return (
                  <div key={phase.id}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{phase.title}</h4>
                    <div className="grid gap-2">
                      {activities.map(act => {
                         const c = themeColors[act.colorTheme] || themeColors.orange;
                         return (
                           <button key={act.id} onClick={() => selectActivityToLog(act)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] text-left ${c.bg} ${c.border}`}>
                             <span className="text-2xl bg-card p-1.5 rounded-lg shadow-sm">{act.icon}</span>
                             <div>
                               <p className={`font-bold text-sm leading-tight ${c.text}`}>{act.title} - {act.name}</p>
                               <p className={`text-[10px] mt-0.5 opacity-80 ${c.text}`}>{act.overview}</p>
                             </div>
                           </button>
                         )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {reportLog && (
        <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-card w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-6 shadow-xl border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Completion Report</h3>
              <button onClick={() => setReportLog(null)} className="p-2 bg-muted rounded-full hover:bg-border"><X size={16}/></button>
            </div>
            
            {(() => {
              const act = getActivityById(reportLog.activityId);
              if(!act) return <p>Activity data missing.</p>;
              const c = themeColors[act.colorTheme] || themeColors.orange;
              const exercises = act.items.filter(i => i.nodeType === 'Exercise').map(i => i.data as Exercise);
              
              return (
                <div>
                  <div className={`p-4 rounded-xl border ${c.bg} ${c.border} mb-6 flex justify-between items-center`}>
                    <div>
                       <p className={`font-bold text-lg ${c.text}`}>{act.icon} {act.name}</p>
                       <p className={`text-xs opacity-80 ${c.text}`}>{reportLog.date}</p>
                    </div>
                    <div className="text-right">
                       <p className={`text-xl font-black ${c.text}`}>{Math.round((reportLog.sessionValue as unknown as number) * 100)}%</p>
                       <p className={`text-[10px] font-bold uppercase ${c.text}`}>Session Logged</p>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-bold mb-3 border-b border-border pb-2">Exercise Breakdown</h4>
                  <div className="space-y-2">
                    {exercises.map(ex => {
                       const isDone = reportLog.completedExercises.includes(ex.id);
                       const isSkipped = reportLog.skippedExercises.includes(ex.id);
                       return (
                         <div key={ex.id} className="flex items-center justify-between p-2.5 bg-muted rounded-lg text-sm">
                           <span className="font-medium text-foreground max-w-[70%] truncate">{ex.name}</span>
                           {isDone ? <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded"><CheckCircle2 size={12}/> Done</span> :
                            isSkipped ? <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded"><XCircle size={12}/> Skipped</span> :
                            <span className="text-xs text-muted-foreground">Unmarked</span>}
                         </div>
                       )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  );
}