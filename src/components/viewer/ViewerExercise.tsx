import React, { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import type { Exercise } from '../../types';
import { isVideoUrl } from '../../lib/utils';
import { ImageViewer } from '../common/ImageViewer';

export function ViewerExercise({ exercise, index }: { exercise: Exercise, index: number }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  
  return (
    <div className="bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col">
        {exercise.images && exercise.images.length > 0 && (
          <div className="relative w-full h-64 md:h-80 bg-muted cursor-zoom-in group" onClick={() => setViewerOpen(true)}>
            {isVideoUrl(exercise.images[0]) ? (
              <video src={exercise.images[0]} loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={exercise.images[0]} alt={exercise.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"><div className="bg-black/60 text-white rounded-full p-2 shadow-lg"><ZoomIn size={20}/></div></div>
            {exercise.priority && <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow pointer-events-none">⭐ Priority</div>}
            {exercise.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg pointer-events-none">
                1 / {exercise.images.length}
              </div>
            )}
          </div>
        )}
        <div className="p-5 md:p-6">
          <div className="mb-3">
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">{exercise.title || `Item ${index}`}</span>
            <h3 className="text-xl font-bold text-foreground mt-0.5 leading-tight">
              {exercise.icon && <span className="mr-2">{exercise.icon}</span>}
              {exercise.name}
            </h3>
          </div>
          {exercise.description && <p className="text-base text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap">{exercise.description}</p>}
          
          {exercise.howTo && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/30 rounded-lg px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">How To</p>
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed whitespace-pre-wrap">{exercise.howTo}</p>
            </div>
          )}

          {exercise.highlights && exercise.highlights.length > 0 && (
            <div className={`grid gap-3 mb-4 ${exercise.highlightLayout === '3x1' ? 'grid-cols-3' : exercise.highlightLayout === '1x2' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {exercise.highlights.map(h => (
                <div key={h.id} className="bg-muted rounded-lg p-3 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">{h.icon} {h.name}</span>
                  <span className="text-sm font-bold text-foreground mt-0.5">{h.value}</span>
                </div>
              ))}
            </div>
          )}

          {exercise.note && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/30 rounded-lg px-4 py-3 flex gap-3 items-start">
              <span className="text-amber-500 flex-shrink-0 mt-0.5">{exercise.priority ? "🔑" : "⚠️"}</span>
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed whitespace-pre-wrap">{exercise.note}</p>
            </div>
          )}
        </div>
      </div>
      {viewerOpen && <ImageViewer images={exercise.images} exerciseName={exercise.name} onClose={() => setViewerOpen(false)}/>}
    </div>
  );
}