import React, { useState } from 'react';
import { Minimize2, Maximize2, CheckCircle2, XCircle, Activity as ActivityIcon } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import type { Activity, Exercise } from '../../types';
import { themeColors, generateId } from '../../lib/utils';
import { ConfirmModal } from '../common/ConfirmModal';
import { FitnessAPI } from '../../services/fitnessApi';

export function ActiveWorkoutOverlay() {
  const { activeWorkout, setActiveWorkout, phases, workoutLogs, setWorkoutLogs } = useAppContext();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!activeWorkout) return null;

  // Find the current activity data
  let currentActivity: Activity | null = null;
  for (const p of phases) {
    for (const item of p.items) {
      if (item.nodeType === 'Activity' && item.data.id === activeWorkout.activityId) {
        currentActivity = item.data as Activity;
        break;
      }
    }
    if (currentActivity) break;
  }

  if (!currentActivity) return null;

  const exercises = currentActivity.items.filter(i => i.nodeType === 'Exercise').map(i => i.data as Exercise);
  const totalEx = exercises.length;
  const doneCount = activeWorkout.completedExerciseIds.length;
  const skipCount = activeWorkout.skippedExerciseIds.length;
  const progress = totalEx > 0 ? ((doneCount + skipCount) / totalEx) * 100 : 0;
  const c = themeColors[currentActivity.colorTheme] || themeColors.orange;

  const toggleExercise = (id: string, status: 'done' | 'skip') => {
    const isDone = activeWorkout.completedExerciseIds.includes(id);
    const isSkipped = activeWorkout.skippedExerciseIds.includes(id);
    
    let newDone = activeWorkout.completedExerciseIds.filter(x => x !== id);
    let newSkip = activeWorkout.skippedExerciseIds.filter(x => x !== id);

    if (status === 'done' && !isDone) newDone.push(id);
    if (status === 'skip' && !isSkipped) newSkip.push(id);

    setActiveWorkout({ ...activeWorkout, completedExerciseIds: newDone, skippedExerciseIds: newSkip });
  };

  const finishWorkout = async () => {
    const sessionValue = totalEx > 0 ? (doneCount / totalEx) : 1;
    const newLog = {
      id: generateId(), // The unique React-generated ID!
      activityId: activeWorkout.activityId,
      date: activeWorkout.dateStarted,
      completedExercises: activeWorkout.completedExerciseIds,
      skippedExercises: activeWorkout.skippedExerciseIds,
      sessionValue
    };
    
    // 1. Save to local React State immediately (Instant UI update)
    setWorkoutLogs([...workoutLogs, newLog]);
    
    // 2. Safely send to our new .NET PostgreSQL Backend! (Bug 4 Fix integration)
    try {
      await FitnessAPI.logSession(newLog);
    } catch (e) {
      console.error("Failed to save to DB, but saved locally:", e);
    }
    
    setActiveWorkout(null);
    setShowConfirm(false);
  };

  // Minimized "Floating" View
  if (activeWorkout.isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-[400] flex items-center gap-3 p-3 rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition-transform ${c.bg} ${c.text} border ${c.border}`} onClick={() => setActiveWorkout({...activeWorkout, isMinimized: false})}>
        <div className="bg-white/20 p-2 rounded-xl"><ActivityIcon size={20} /></div>
        <div className="pr-2">
          <p className="text-xs font-bold opacity-80">Workout in Progress</p>
          <p className="text-sm font-extrabold">{currentActivity.name}</p>
        </div>
        <button className="p-1 hover:bg-white/20 rounded-full" onClick={(e) => { e.stopPropagation(); setActiveWorkout({...activeWorkout, isMinimized: false}); }}><Maximize2 size={16}/></button>
      </div>
    );
  }

  // Maximized Fullscreen View
  return (
    <>
      <div className="fixed inset-0 z-[400] bg-background/95 backdrop-blur-md flex flex-col animate-in slide-in-from-bottom-full duration-300">
        <div className={`p-4 md:p-6 flex items-center justify-between border-b ${c.bg} ${c.text}`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-80 flex items-center gap-1"><ActivityIcon size={12}/> Active Session</span>
            <h2 className="text-xl md:text-2xl font-black mt-0.5">{currentActivity.icon} {currentActivity.name}</h2>
          </div>
          <button onClick={() => setActiveWorkout({...activeWorkout, isMinimized: true})} className="p-2 hover:bg-white/20 rounded-full transition-colors"><Minimize2 size={24}/></button>
        </div>

        <div className="w-full bg-muted h-1.5"><div className={`h-full transition-all duration-500 ${c.bg}`} style={{ width: `${progress}%`}} /></div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 max-w-3xl mx-auto w-full hide-scrollbar">
          {exercises.map((ex, idx) => {
            const isDone = activeWorkout.completedExerciseIds.includes(ex.id);
            const isSkipped = activeWorkout.skippedExerciseIds.includes(ex.id);
            return (
              <div key={ex.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${isDone ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : isSkipped ? 'bg-muted opacity-60 border-transparent' : 'bg-card border-border shadow-sm'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground bg-muted w-6 h-6 flex items-center justify-center rounded-full">{idx+1}</span>
                  <div>
                    <p className={`font-bold ${isDone ? 'text-green-700 dark:text-green-400' : isSkipped ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{ex.name}</p>
                    {ex.note && <p className="text-[10px] text-muted-foreground mt-0.5 max-w-xs truncate">{ex.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button onClick={() => toggleExercise(ex.id, 'skip')} className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors ${isSkipped ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-500'}`}><XCircle size={14}/> Skip</button>
                  <button onClick={() => toggleExercise(ex.id, 'done')} className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors ${isDone ? 'bg-green-500 text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-green-500 hover:text-white'}`}><CheckCircle2 size={14}/> {isDone ? 'Done' : 'Complete'}</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 md:p-6 border-t border-border bg-card max-w-3xl mx-auto w-full flex gap-3">
          <button onClick={() => setShowConfirm(true)} className="flex-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold py-3 md:py-4 rounded-xl hover:opacity-80 transition-opacity">End Early</button>
          <button onClick={finishWorkout} disabled={progress === 0} className="flex-[2] bg-orange-500 text-white font-bold py-3 md:py-4 rounded-xl shadow-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Finish Workout</button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="End Workout Early?"
          message={`You have completed ${doneCount} out of ${totalEx} exercises. Are you sure you want to end this session now?`}
          confirmText="End Workout"
          isDanger={true}
          onConfirm={finishWorkout}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}