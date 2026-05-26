import React from 'react';
import { Target, Play } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import type { Activity } from '../../types';
import { themeColors, getLocalISODate } from '../../lib/utils';
import { ViewerIndependentItem } from './ViewerIndependentItem';
import { ViewerExercise } from './ViewerExercise';

const TargetIcon = () => <Target size={16} />;

export function ViewerActivity({ activity }: { activity: Activity }) {
  const { workoutLogs, activeWorkout, setActiveWorkout } = useAppContext();
  const c = themeColors[activity.colorTheme] || themeColors.orange;
  const isTargeted = (activity.targetSessions||0) > 0;
  
  const logsForActivity = workoutLogs.filter(l => l.activityId === activity.id);
  const completedSessions = logsForActivity.reduce((sum, log) => sum + log.sessionValue, 0);
  const progressPct = isTargeted ? Math.min((completedSessions / activity.targetSessions!) * 100, 100) : 0;

  const handleStartWorkout = () => {
    if (activeWorkout) { if (!confirm("End current workout and start this one?")) return; }
    setActiveWorkout({ activityId: activity.id, dateStarted: getLocalISODate(new Date()), completedExerciseIds: [], skippedExerciseIds: [], isMinimized: false });
  };

  return (
    <div id={activity.id} className="section-anchor pt-6 space-y-6">
      
      {isTargeted && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-2">
           <div className="flex justify-between items-center text-sm font-bold">
              <span className="flex items-center gap-2"><TargetIcon /> Sessions Goal</span>
              <span className="text-orange-500">{completedSessions} / {activity.targetSessions}</span>
           </div>
           <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
             <div className="bg-gradient-to-r from-orange-400 to-red-500 h-full progress-strip" style={{ width: `${progressPct}%`}}></div>
           </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden shadow-md">
        <div className={`bg-gradient-to-r ${c.gradient} p-6 md:p-8 text-white relative`}>
          
          <button onClick={handleStartWorkout} className="absolute top-6 right-6 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold text-sm shadow-sm transition-colors border border-white/20">
            <Play size={16} fill="white"/> Start Workout
          </button>

          <div className="flex items-start gap-4 pr-32">
            <span className="text-4xl">{activity.icon}</span>
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest opacity-90">{activity.title}</span>
              <h2 className="text-3xl font-extrabold leading-tight mt-1">{activity.name}</h2>
              <p className="text-base opacity-90 mt-1 font-medium">{activity.overview}</p>
            </div>
          </div>
          {activity.description && (
            <div className="mt-6 bg-white/15 rounded-xl p-4 border border-white/10">
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{activity.description}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 space-y-6">
        {activity.items.map((node, i) => {
          if (!node.data.isActive) return null;
          if (node.nodeType === 'IndependentItem') return <ViewerIndependentItem key={node.data.id} item={node.data} />;
          if (node.nodeType === 'Exercise') return <ViewerExercise key={node.data.id} exercise={node.data} index={i+1} />;
          return null;
        })}
      </div>
    </div>
  );
}