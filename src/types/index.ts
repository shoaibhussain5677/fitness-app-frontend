export type Highlight = { id: string; name: string; value: string; icon?: string };

export type IndependentItem = {
  id: string; type: 'Header' | 'Highlights' | 'Note'; title?: string; description?: string; color?: string; icon?: string; highlights?: Highlight[]; highlightLayout?: '3x1' | '1x2' | 'grid'; isActive: boolean;
};

export type Exercise = {
  id: string; type: 'Workout' | 'Instruction'; title: string; name: string; description?: string; howTo?: string; note?: string; images: string[]; highlights: Highlight[]; highlightLayout?: '3x1' | '1x2' | 'grid'; priority?: boolean; isActive: boolean; icon?: string;
};

export type ActivityNode = { nodeType: 'Exercise', data: Exercise } | { nodeType: 'IndependentItem', data: IndependentItem };

export type Activity = {
  id: string; title: string; name: string; overview: string; description: string; icon: string; colorTheme: string; targetSessions?: number; items: ActivityNode[]; isActive: boolean;
};

export type PhaseNode = { nodeType: 'Activity', data: Activity } | { nodeType: 'IndependentItem', data: IndependentItem };

export type Phase = { id: string; title: string; items: PhaseNode[]; isActive: boolean; };

export type WorkoutLog = {
  id: string; activityId: string; date: string; 
  completedExercises: string[]; skippedExercises: string[]; sessionValue: number; 
};

export type ActiveWorkout = {
  activityId: string; dateStarted: string; completedExerciseIds: string[]; skippedExerciseIds: string[]; isMinimized: boolean;
};