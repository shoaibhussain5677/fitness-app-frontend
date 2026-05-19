import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import {
  Menu, X, Sun, Moon, ChevronRight, ChevronLeft, Dumbbell, Waves, ZoomIn, ZoomOut, RotateCcw,
  ChevronDown, ChevronUp, Home, Settings, Plus, Edit2, Trash2,
  Eye, EyeOff, MoveUp, MoveDown, LayoutGrid, AlertCircle, GripVertical,
  Upload, Download, Save, Play, CheckCircle2, XCircle, Minimize2, Maximize2, ListTodo, BarChart2, Target, Calendar, Search, Loader2
} from "lucide-react";

// ==========================================
// 1. STYLES & THEME
// ==========================================
const globalCss = `
  :root {
    --background: 30 15% 97%;
    --foreground: 220 20% 10%;
    --border: 30 10% 85%;
    --card: 0 0% 100%;
    --card-border: 30 10% 88%;
    --muted: 30 10% 94%;
    --muted-foreground: 220 10% 45%;
    --sidebar: 0 0% 98%;
    --sidebar-foreground: 220 20% 10%;
    --sidebar-border: 30 10% 85%;
    --sidebar-accent: 30 10% 90%;
  }
  .dark {
    --background: 222 20% 10%;
    --foreground: 210 20% 92%;
    --border: 222 15% 20%;
    --card: 222 20% 13%;
    --card-border: 222 15% 22%;
    --muted: 222 20% 16%;
    --muted-foreground: 210 10% 50%;
    --sidebar: 222 25% 8%;
    --sidebar-foreground: 210 20% 88%;
    --sidebar-border: 222 20% 16%;
    --sidebar-accent: 222 20% 16%;
  }
  body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
  .section-anchor { scroll-margin-top: 24px; }
  @media (max-width: 1023px) { .section-anchor { scroll-margin-top: 72px; } }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .progress-strip { transition: width 0.4s ease-out; }
`;

const GlobalStyles = () => <style>{globalCss}</style>;

// Native Theme Context
const ThemeContext = createContext<{ theme: string; setTheme: (t: string) => void }>({ theme: 'light', setTheme: () => {} });
const useTheme = () => useContext(ThemeContext);

const ThemeProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  if (!mounted) return null;
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

// ==========================================
// 2. DATA MODELS & TYPES
// ==========================================
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

const generateId = () => Math.random().toString(36).substring(2, 9);
const getLocalISODate = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];

const EMOJIS = [
  { char: "🏋️", keywords: "weight lift gym push strength" }, { char: "🦵", keywords: "leg glutes lower body" }, { char: "💪", keywords: "arm flex pull bicep back" }, { char: "⚡", keywords: "energy lightning fast cardio full" }, { char: "🏊", keywords: "swim water pool cardio" }, { char: "🧘", keywords: "stretch yoga mobility routine" }, { char: "🏃", keywords: "run sprint cardio active" }, { char: "🚶", keywords: "walk active recovery stroll" }, { char: "😴", keywords: "sleep rest bed night" }, { char: "🔄", keywords: "sync refresh loop cycle recovery" }, { char: "🎯", keywords: "target aim goal reps sets" }, { char: "⏱️", keywords: "timer clock time rest hold" }, { char: "⚠️", keywords: "warning alert note danger" }, { char: "💡", keywords: "idea bulb tip note highlight" }, { char: "📌", keywords: "pin attach item point" }, { char: "🏠", keywords: "home house alternative" }, { char: "🥩", keywords: "meat protein food beef" }, { char: "🍚", keywords: "rice carbs food grain" }, { char: "🥑", keywords: "avocado fats food healthy" }, { char: "💧", keywords: "water drop hydration drink" }, { char: "🔥", keywords: "fire burn intense hot" }, { char: "🚫", keywords: "stop block avoid no" }
];

const createHighlights = (sets: string, reps: string, rest: string): Highlight[] => [
  { id: generateId(), name: "Sets", value: sets, icon: "🔄" }, { id: generateId(), name: "Reps", value: reps, icon: "🎯" }, { id: generateId(), name: "Rest", value: rest, icon: "⏱️" }
];
const createTargetHold = (target: string, hold: string): Highlight[] => [
  { id: generateId(), name: "Target", value: target, icon: "🎯" }, { id: generateId(), name: "Hold", value: hold, icon: "⏱️" }
];

// Helper to determine if a string path/URL is a video media file
const isVideoUrl = (url: string) => {
  if (!url) return false;
  return url.startsWith("data:video/") || url.includes("#video") || url.includes(".mp4") || url.includes(".webm") || url.includes(".mov");
};

// Dynamic SheetJS loader utility
const loadXLSX = async (): Promise<any> => {
  if ((window as any).XLSX) return (window as any).XLSX;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => resolve((window as any).XLSX);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Initial Data Mapping
const initialPhases: Phase[] = [
  {
    id: "p_v2_1", title: "Weeks 1–4: Foundation", isActive: true, items: [
      {
        nodeType: 'Activity',
        data: {
          id: "a_upper", title: "Day 1 & 6", name: "THE UPPER WORKOUT", overview: "Chest · Back · Shoulders · Arms", description: "Compounds before isolation, and larger muscles before smaller muscles. Ensures you're freshest for the movements that produce the most growth stimulus.", icon: "🏋️", colorTheme: "red", targetSessions: 16, isActive: true,
          items: [
            { nodeType: 'IndependentItem', data: { id: generateId(), type: 'Note', title: '💡 Warm-up Protocol', description: "Phase 1: Treadmill walk/bike (3 min)\nPhase 2: Dynamic mobility (Cat-Cow, Lunge Stretch, Arm Circles, Squats)\nPhase 3: Ramp-up sets (50% and 70% of working weight)", color: 'orange', icon: '💡', isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 1", name: "Incline Dumbbell Press", description: "Targets upper chest, front deltoids, triceps.", howTo: "Set bench to 30° incline. Press upward and slightly inward. Lower slowly over 3 seconds.", images: ["https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Chest-Press-Machine.gif"], highlights: createHighlights("3", "12", "90 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 2", name: "Machine Chest Press", description: "Targets mid and lower chest, triceps, front deltoids.", howTo: "Adjust seat to mid-chest. Press to full extension (don't lock), squeeze for 1 second, return over 3 seconds.", images: ["https://training.fit/wp-content/uploads/2020/02/schraegbankdruecken-maschine.png"], highlights: createHighlights("3", "12", "75 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 3", name: "Lat Pulldown (Wide Grip)", description: "Builds the latissimus dorsi to create a V-taper.", howTo: "Grip wider than shoulder-width, lean back slightly. Pull bar to upper chest, drive elbows down and back.", images: ["https://weighttraining.guide/wp-content/uploads/2016/05/wide-grip-lat-pull-down-resized.png"], highlights: createHighlights("3", "12-15", "90 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 4", name: "Seated Cable Row (V-Bar)", description: "Targets mid-back (rhomboids, middle trapezius).", howTo: "Sit tall. Pull V-bar toward lower chest, driving elbows back. Squeeze shoulder blades together.", images: ["https://fitnessprogramer.com/wp-content/uploads/2021/06/Seated-Cable-Rope-Row.gif"], highlights: createHighlights("3", "12-15", "90 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 5", name: "Seated DB Shoulder Press", description: "Targets anterior and lateral deltoids.", howTo: "Bench at 85-90°. Press upward following the scapular plane. Stop just short of lockout.", images: ["https://workoutlabs.com/fit/pin-ex/cache-png/4278-m.png"], highlights: createHighlights("3", "12", "90 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 6", name: "Dumbbell Lateral Raise", description: "Crucial for shoulder width (lateral deltoid).", howTo: "Raise arms out to sides to shoulder height. Lead with elbows. Lower over 3 seconds.", note: "Use light weight here — this is a precision exercise, not an ego lift.", images: ["https://workoutlabs.com/fit/pin-ex/cache-png/7454-m.png"], highlights: createHighlights("3", "15-20", "45-60s"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 7", name: "Cable Face Pull", priority: true, description: "Protects shoulders and fixes desk posture.", howTo: "Pull rope toward face, splitting it. Elbows high and wide. Hold 1 sec.", note: "DO NOT SKIP THIS EXERCISE.", images: ["https://liftmanual.com/wp-content/uploads/2023/04/cable-standing-face-pull.jpg"], highlights: createHighlights("3", "15-20", "45-60s"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 8", name: "EZ-Bar Bicep Curl", description: "Primary bicep strength builder.", howTo: "Underhand grip at shoulder width. Curl in a smooth arc. Lower slowly over 3 seconds.", images: ["https://cdn.shopify.com/s/files/1/1497/9682/files/2_dd805047-4f47-4ebf-ad7b-3336dd3b69d2.jpg?v=1658851624"], highlights: createHighlights("3", "12", "60 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 9", name: "Incline Dumbbell Curl", description: "Targets the long head of the bicep from a stretched position.", howTo: "Bench at 45-60°. Curl dumbbells up while rotating wrists outward. Squeeze at top.", images: ["https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-alternate-biceps-curl.jpg"], highlights: createHighlights("3", "12/arm", "60 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 10", name: "Cable Tricep Pushdown", description: "Primary tricep strength movement.", howTo: "Pin elbows at sides. Push down, spread the rope apart at the bottom and squeeze for 1 second.", images: ["https://www.hevyapp.com/wp-content/uploads/02001101-Cable-Pushdown-with-rope-attachment_Upper-Arms_small.jpg"], highlights: createHighlights("3", "15", "45 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 11", name: "Overhead DB Tricep Extension", description: "Targets long head of the tricep in a stretched position.", howTo: "Hold dumbbell overhead with both hands. Lower behind head until deep stretch, press back up.", images: ["https://www.academiacentralfitness.com.br/en/post/one-arm-triceps-pushdown-the-ultimate-guide-to-sculpting-your-arms"], highlights: createHighlights("3", "12-15", "60 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Finisher", name: "Cardio Finisher", description: "Elevates heart rate post-strength training for fat oxidation.", howTo: "Choose one: Treadmill Walk (5.5km/h, 5% inc), Stationary Bike, or Rowing Machine. Post-smoker rule: Must be able to hold a conversation.", images: ["https://hips.hearstapps.com/hmg-prod/images/training-in-the-gym-royalty-free-image-1724263684.jpg?crop=0.668xw:1.00xh;0.221xw,0&resize=640:*"], highlights: [{ id: generateId(), name: "Duration", value: "15 min", icon: "⏱️" }], highlightLayout: "1x2", isActive: true } }
          ]
        }
      },
      {
        nodeType: 'Activity',
        data: {
          id: "a_lower", title: "Day 3 & 8", name: "THE LOWER WORKOUT", overview: "Quads · Hams · Glutes · Calves · Core", description: "Heavy compound movements first, then isolation and targeted work, finishing with core/abs.", icon: "🦵", colorTheme: "yellow", targetSessions: 16, isActive: true,
          items: [
            { nodeType: 'IndependentItem', data: { id: generateId(), type: 'Note', title: '💡 Warm-up Protocol', description: "Phase 1: Treadmill walk/bike (3 min)\nPhase 2: Dynamic mobility (Cat-Cow, Lunge Stretch, Arm Circles, Squats)\nPhase 3: Ramp-up sets (50% and 70% of working weight)", color: 'orange', icon: '💡', isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 1", name: "Leg Press (High & Wide)", description: "Builds quads and glutes safely without stressing lower back.", howTo: "Feet high on platform. Lower until knees hit 90° without lifting lower back. Press through heels.", images: ["https://preview.redd.it/feet-placement-for-leg-press-v0-343ql7t0m5671.jpg?width=640&crop=smart&auto=webp&s=5daa7662651026facef9846b97e505701f21d8af"], highlights: createHighlights("3", "12-15", "2 min"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 2", name: "Goblet Squat (Dumbbell)", description: "Teaches fundamental squat pattern, trains core and hip mobility.", howTo: "Hold DB vertically at chest. Squat deep keeping chest proud. Elbows track inside knees.", images: ["https://fitnessprogramer.com/wp-content/uploads/2023/01/Dumbbell-Goblet-Squat.gif"], highlights: createHighlights("3", "12-15", "90 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 3", name: "Leg Extension (Slow Tempo)", priority: true, description: "VMO-focused for knee strength and stability.", howTo: "Extend legs fully. Pause at top for 2 full seconds squeezing inner quad. Lower over 4 seconds.", images: ["https://liftmanual.com/wp-content/uploads/2023/04/lever-lying-leg-curl.jpg"], highlights: createHighlights("3", "15", "60 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 4", name: "Romanian Deadlift (DBs)", description: "Best for building hamstrings through a deep stretch.", howTo: "Push hips BACK. Lower weights along front of legs until mid-shin. Back MUST stay flat.", images: ["https://www.pwfitness.ca/wp-content/uploads/2020/02/how-to-RDL.jpg"], highlights: createHighlights("3", "12", "90 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 5", name: "Lying Leg Curl (Machine)", description: "Trains hamstrings at short muscle lengths.", howTo: "Curl heels toward glutes. Hold 1 second. Lower over 3-4 seconds.", images: ["https://fitwill.app/api/image/1547?p=1&w=1920&h=1080"], highlights: createHighlights("3", "12-15", "60 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 6", name: "Barbell Hip Thrust", priority: true, description: "Single most effective exercise for glute development.", howTo: "Drive hips up until body is straight line. Hold top for 1-2 seconds, clenching glutes as hard as possible.", note: "Imagine you're cracking a walnut between your glutes.", images: ["https://liftmanual.com/wp-content/uploads/2023/04/barbell-hip-thrust.jpg"], highlights: createHighlights("3", "15", "90 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 7", name: "Dumbbell Walking Lunges", description: "Unilateral training addressing legs, knees, glutes, and core.", howTo: "Take a large step forward, lower back knee toward floor. Drive through front heel.", images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKCtGPeOeHa1PbrhhubQOibdO2x20mTqEiqw&s"], highlights: createHighlights("3", "10/leg", "90 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 8", name: "Standing Calf Raise", description: "Builds gastrocnemius for defined lower legs.", howTo: "Rise on toes as high as possible, hold 1 sec, lower until deep stretch. Full ROM is critical.", images: ["https://cdn.shopify.com/s/files/1/2350/9323/files/Muscles_Worked_by_the_Smith_Machine_Calf_Raise.jpg?v=1766484243"], highlights: createHighlights("4", "15-20", "45 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 9", name: "Cable Woodchop", description: "Trains rotational power and side core.", howTo: "Pull diagonally across body toward opposite hip. Hips stay stable, rotation from mid-torso.", images: ["https://weighttraining.guide/wp-content/uploads/2017/06/Cable-wood-chop-resized.png"], highlights: createHighlights("3", "12/side", "45 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 10", name: "Cable Crunch", description: "Hypertrophies rectus abdominis for visible abs.", howTo: "Kneel, hold rope at sides of head. Crunch torso downward. Hips don't move. Squeeze 1s.", images: ["https://media.istockphoto.com/id/1312733099/es/vector/woodchop-ejercicio-fuerza-entrenamiento-entrenamiento-vector-ilustraci%C3%B3n-vector.jpg?s=612x612&w=is&k=20&c=YVaxo4_6mC1mGR0Fk6mxq4OcrymkGSihXMO99BTIC-s="], highlights: createHighlights("3", "12-15", "45 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Workout", title: "Exercise 11", name: "Core Superset", description: "Front Plank + Side Plank + Dead Bug done consecutively.", howTo: "Front (20-30s) -> Rest 10s -> Side R (15-20s) -> Rest 10s -> Side L (15-20s) -> Rest 10s -> Dead Bug (8/side) -> Rest 60s. That is 1 set.", images: ["https://liftmanual.com/wp-content/uploads/2023/04/front-plank-with-twist.jpg"], highlights: createHighlights("3", "Superset", "60 sec"), highlightLayout: "3x1", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Finisher", name: "Cardio Finisher", description: "Elevates heart rate post-strength training for fat oxidation.", howTo: "Choose one: Treadmill Walk (5.5km/h, 5% inc), Stationary Bike, or Rowing Machine.", images: ["https://cdn.shopify.com/s/files/1/0507/1611/5119/files/Primary_Muscle_Groups_Worked_During_Rowing.jpg?v=1746517475"], highlights: [{ id: generateId(), name: "Duration", value: "15 min", icon: "⏱️" }], highlightLayout: "1x2", isActive: true } }
          ]
        }
      },
      {
        nodeType: 'Activity',
        data: {
          id: "a_stretch", title: "Rest Days", name: "Stretching Routine", overview: "15–20 minutes", description: "These stretches are specially chosen for your desk job posture and tight areas.", icon: "🧘", colorTheme: "orange", targetSessions: 12, isActive: true,
          items: [
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Stretch 1", name: "Cat-Cow", images: ["https://liftmanual.com/wp-content/uploads/2023/04/cat-cow-stretch.jpg"], highlights: createTargetHold("Spine, lower back", "10 reps slow"), highlightLayout: "1x2", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Stretch 2", name: "Hip Flexor Lunge Stretch", images: ["https://liftmanual.com/wp-content/uploads/2023/04/kneeling-hip-flexor-stretch.jpg"], highlights: createTargetHold("Hip flexors, psoas", "45 sec/side"), highlightLayout: "1x2", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Stretch 3", name: "Glute Figure-4 Stretch", images: ["https://liftmanual.com/wp-content/uploads/2023/04/seated-glute-stretch.gif"], highlights: createTargetHold("Glutes, piriformis", "45 sec/side"), highlightLayout: "1x2", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Stretch 4", name: "Standing Hamstring Stretch", images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5FRkM6CScrVd5wNX9011JgrZEkZX1E-7rrA&s"], highlights: createTargetHold("Hamstrings, lower back", "45–60 sec"), highlightLayout: "1x2", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Stretch 5", name: "Thread-the-Needle", images: ["https://www.inspireusafoundation.org/wp-content/uploads/2023/09/thread-the-needle-stretch.gif"], highlights: createTargetHold("Upper back, thoracic spine", "30 sec/side"), highlightLayout: "1x2", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Stretch 6", name: "Chest Doorway Stretch", images: ["https://abbottcenter.com/bostonpaintherapy/wp-content/uploads/2009/05/doorwaystretch.jpg"], highlights: createTargetHold("Chest, front shoulders", "45 sec"), highlightLayout: "1x2", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Stretch 7", name: "Child's Pose", images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKGjlDlAlAn79XSK3z6ZxH2h1vOwKGfXP6og&s"], highlights: createTargetHold("Lower back, lats, hips", "60 sec"), highlightLayout: "1x2", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Stretch 8", name: "Seated Pigeon Stretch", images: ["https://dims.healthgrades.com/dims3/MMH/2de8b05/2147483647/strip/true/crop/400x260+0+70/resize/768x500!/quality/75/?url=https%3A%2F%2Fucmscdn.healthgrades.com%2F83%2F34%2F75454935e10a5edb2e2c9e0d2f5b%2Fbasic-seated-stretch-body7.gif"], highlights: createTargetHold("Deep glutes, hip rotators", "45 sec/side"), highlightLayout: "1x2", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Stretch 9", name: "Neck Side Stretch", images: ["https://liftmanual.com/wp-content/uploads/2023/04/side-neck-stretch.jpg"], highlights: createTargetHold("Cervical spine, upper traps", "30 sec/side"), highlightLayout: "1x2", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Stretch 10", name: "World's Greatest Stretch", images: ["https://liftmanual.com/wp-content/uploads/2023/04/worlds-greatest-stretch.jpg"], highlights: createTargetHold("Full body", "5 reps/side"), highlightLayout: "1x2", isActive: true } }
          ]
        }
      },
      {
        nodeType: 'Activity',
        data: {
          id: "a_recov", title: "Daily", name: "Recovery & Habits", overview: "Sleep · Nutrition · Walking", description: "Muscle is built during sleep, not in the gym.", icon: "🔄", colorTheme: "blue", targetSessions: 28, isActive: true,
          items: [
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Habit 1", name: "Sleep (Most Important)", description: "Aim for 7–8 hours. Manage cortisol.", images: [], highlights: [{ id: generateId(), name: "Focus", value: "Deep Sleep", icon: "😴" }], highlightLayout: "1x2", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Habit 2", name: "Nutrition Target", description: "Protein: 130-150g/day. Calories: 1850-2000 kcal. Minimum 3L water.", images: [], highlights: [{ id: generateId(), name: "Avoid", value: "Processed food & excess oil", icon: "🚫" }], highlightLayout: "1x2", isActive: true } },
            { nodeType: 'Exercise', data: { id: generateId(), type: "Instruction", title: "Habit 3", name: "Rest-Day Walking", description: "Walk briskly 20-30 minutes on at least 3 of your 6 rest days.", images: [], highlights: [{ id: generateId(), name: "Target", value: "Fat Loss", icon: "🚶" }], highlightLayout: "1x2", isActive: true } }
          ]
        }
      }
    ]
  },
  { id: "p_v2_2", title: "Weeks 5–8: Build", isActive: true, items: [] },
  { id: "p_v2_3", title: "Weeks 9–12: Intensify", isActive: true, items: [] }
];

// ==========================================
// 4. CONTEXT & STATE MANAGEMENT
// ==========================================
type AppContextType = {
  viewMode: 'app' | 'builder'; setViewMode: (m: 'app' | 'builder') => void;
  phases: Phase[]; setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
  workoutLogs: WorkoutLog[]; setWorkoutLogs: React.Dispatch<React.SetStateAction<WorkoutLog[]>>;
  activeWorkout: ActiveWorkout | null; setActiveWorkout: React.Dispatch<React.SetStateAction<ActiveWorkout | null>>;
  activeTab: 'plan' | 'tracker'; setActiveTab: (t: 'plan' | 'tracker') => void;
};
const AppContext = createContext<AppContextType | null>(null);

function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("Missing AppContext");
  return ctx;
}

// ==========================================
// 5. HELPER COMPONENTS (Shared)
// ==========================================
const themeColors: Record<string, { bg: string, text: string, border: string, gradient: string }> = {
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/40', gradient: 'from-orange-500 to-red-500' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/40', gradient: 'from-blue-500 to-cyan-600' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800/40', gradient: 'from-red-500 to-pink-600' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800/40', gradient: 'from-yellow-500 to-orange-500' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800/40', gradient: 'from-green-500 to-emerald-600' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/40', gradient: 'from-purple-500 to-indigo-600' },
};

function ConfirmModal({ title, message, onConfirm, onCancel }: { title: string, message: string, onConfirm: () => void, onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[400] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-xl border border-border animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 font-bold text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md">Confirm</button>
        </div>
      </div>
    </div>
  );
}

function ImageViewer({ images, exerciseName, onClose }: { images: string[], exerciseName: string, onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="fixed inset-0 z-[600] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
        <X size={24}/>
      </button>
      <div className="relative max-w-4xl w-full flex flex-col items-center">
        {isVideoUrl(images[idx]) ? (
          <video src={images[idx]} controls autoPlay loop muted playsInline className="max-w-full max-h-[75vh] rounded-lg shadow-2xl" />
        ) : (
          <img src={images[idx]} alt={exerciseName} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" />
        )}
        {images.length > 1 && (
          <div className="flex items-center gap-4 mt-6">
            <button onClick={() => setIdx(Math.max(0, idx-1))} disabled={idx===0} className="px-4 py-2 bg-white/20 text-white rounded-lg disabled:opacity-50 font-bold backdrop-blur-md">Prev</button>
            <span className="text-white font-bold">{idx + 1} / {images.length}</span>
            <button onClick={() => setIdx(Math.min(images.length-1, idx+1))} disabled={idx===images.length-1} className="px-4 py-2 bg-white/20 text-white rounded-lg disabled:opacity-50 font-bold backdrop-blur-md">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

const BaseModal = ({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[600] bg-black/60 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
    <div className="bg-card w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-xl border border-border">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="text-xl font-bold">{title}</h3>
        <button type="button" onClick={onClose} className="p-2 bg-muted rounded-full hover:bg-border transition-colors"><X size={16}/></button>
      </div>
      <div className="p-4 overflow-y-auto">{children}</div>
    </div>
  </div>
);

// ==========================================
// IMAGE SEARCH COMPONENT WITH MULTI-SOURCE TANDEM FALLBACK
// ==========================================
function ImageSearch({ currentName, onSelectImage }: { currentName: string, onSelectImage: (url: string) => void }) {
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
        // Attempt 1: Direct fetch
        return await fetchWithTimeout(targetUrl);
      } catch (directErr) {
        // Attempt 2: CORS Proxy Fallback
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

    // SOURCE 2: Wger Project (If Source 1 yielded nothing)
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

    // SOURCE 3: Wrkout / exercises.json (If Sources 1 & 2 yielded nothing)
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

// ==========================================
// BUILDER MODULE (Full Interactive Dashboard)
// ==========================================
type ModalConfig = 
  | { type: 'Phase', data?: Phase }
  | { type: 'Activity', phaseId: string, data?: Activity }
  | { type: 'Exercise', phaseId: string, activityId: string, data?: Exercise }
  | { type: 'IndependentItem', phaseId: string, activityId: string, data?: IndependentItem }
  | null;

function BuilderDashboard() {
  const { phases, setPhases, setViewMode } = useAppContext();
  const [activePhaseId, setActivePhaseId] = useState<string>(phases[0]?.id || "");
  const [modalConfig, setModalConfig] = useState<ModalConfig>(null);
  const [excelStatus, setExcelStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const saveExercise = (exData: Exercise) => {
    if (modalConfig?.type !== 'Exercise') return;
    updateActivityNode(modalConfig.phaseId, modalConfig.activityId, { nodeType: 'Exercise', data: exData });
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

  // ==========================================
  // CONSOLIDATED SPREADSHEET IMPORT/EXPORT HANDLERS
  // ==========================================
  const handleExportSpreadsheet = async () => {
    try {
      const XLSX = await loadXLSX();
      
      // 1. Build Phase Template Rows (Sheet 1)
      const phaseRows: any[] = [];
      phases.forEach(phase => {
        if (phase.items.length === 0) {
          phaseRows.push({
            'Phase ID': phase.id,
            'Phase Title': phase.title,
            'Phase Is Active': phase.isActive ? 'True' : 'False',
            'Item Node Type': '',
            'Item ID': '',
            'Item Type': '',
            'Item Title': '',
            'Item Description': '',
            'Item Is Active': '',
            'Activity Name': '',
            'Activity Overview': '',
            'Activity Icon': '',
            'Activity Color Theme': '',
            'Activity Target Sessions': ''
          });
        } else {
          phase.items.forEach(node => {
            const row: any = {
              'Phase ID': phase.id,
              'Phase Title': phase.title,
              'Phase Is Active': phase.isActive ? 'True' : 'False',
              'Item Node Type': node.nodeType,
              'Item ID': node.data.id,
              'Item Type': node.nodeType === 'IndependentItem' ? (node.data as IndependentItem).type : '',
              'Item Title': node.data.title || '',
              'Item Description': node.nodeType === 'IndependentItem' ? (node.data as IndependentItem).description : '',
              'Item Is Active': node.data.isActive ? 'True' : 'False',
              'Activity Name': node.nodeType === 'Activity' ? (node.data as Activity).name : '',
              'Activity Overview': node.nodeType === 'Activity' ? (node.data as Activity).overview : '',
              'Activity Icon': node.nodeType === 'Activity' ? (node.data as Activity).icon : '',
              'Activity Color Theme': node.nodeType === 'Activity' ? (node.data as Activity).colorTheme : '',
              'Activity Target Sessions': node.nodeType === 'Activity' ? ((node.data as Activity).targetSessions || 0) : ''
            };
            phaseRows.push(row);
          });
        }
      });

      // 2. Build Activity Template Rows (Sheet 2)
      const activityRows: any[] = [];
      phases.forEach(phase => {
        phase.items.forEach(node => {
          if (node.nodeType === 'Activity') {
            const act = node.data as Activity;
            if (act.items.length === 0) {
              activityRows.push({
                'Activity ID': act.id,
                'Activity Title': act.title,
                'Activity Name': act.name,
                'Activity Overview': act.overview,
                'Activity Description': act.description,
                'Activity Icon': act.icon,
                'Activity Color Theme': act.colorTheme,
                'Activity Target Sessions': act.targetSessions || 0,
                'Activity Is Active': act.isActive ? 'True' : 'False',
                'Item Node Type': '',
                'Item ID': '',
                'Item Type': '',
                'Item Title': '',
                'Item Name': '',
                'Item Description': '',
                'Item How To': '',
                'Item Note': '',
                'Item Images': '',
                'Item Highlight Layout': '',
                'Item Priority': '',
                'Item Is Active': '',
                'Item Color': '',
                'Item Icon': ''
              });
            } else {
              act.items.forEach(child => {
                const isEx = child.nodeType === 'Exercise';
                const ex = isEx ? child.data as Exercise : null;
                const ind = !isEx ? child.data as IndependentItem : null;

                const row: any = {
                  'Activity ID': act.id,
                  'Activity Title': act.title,
                  'Activity Name': act.name,
                  'Activity Overview': act.overview,
                  'Activity Description': act.description,
                  'Activity Icon': act.icon,
                  'Activity Color Theme': act.colorTheme,
                  'Activity Target Sessions': act.targetSessions || 0,
                  'Activity Is Active': act.isActive ? 'True' : 'False',
                  'Item Node Type': child.nodeType,
                  'Item ID': child.data.id,
                  'Item Type': isEx ? ex!.type : ind!.type,
                  'Item Title': child.data.title || '',
                  'Item Name': isEx ? ex!.name : '',
                  'Item Description': isEx ? (ex!.description || '') : (ind!.description || ''),
                  'Item How To': isEx ? (ex!.howTo || '') : '',
                  'Item Note': isEx ? (ex!.note || '') : '',
                  'Item Images': isEx ? (ex!.images || []).join(', ') : '',
                  'Item Highlight Layout': isEx ? (ex!.highlightLayout || '3x1') : '',
                  'Item Priority': isEx ? (ex!.priority ? 'True' : 'False') : '',
                  'Item Is Active': child.data.isActive ? 'True' : 'False',
                  'Item Color': !isEx ? (ind!.color || '') : '',
                  'Item Icon': isEx ? (ex!.icon || '') : (ind!.icon || '')
                };

                // Inject highlights (up to 4)
                const highlights = isEx ? (ex!.highlights || []) : [];
                for (let hIdx = 0; hIdx < 4; hIdx++) {
                  const h = highlights[hIdx];
                  row[`Highlight ${hIdx + 1} Name`] = h ? h.name : '';
                  row[`Highlight ${hIdx + 1} Value`] = h ? h.value : '';
                  row[`Highlight ${hIdx + 1} Icon`] = h ? (h.icon || '') : '';
                }

                activityRows.push(row);
              });
            }
          }
        });
      });

      // Assemble Workbook
      const wb = XLSX.utils.book_new();
      const wsPhases = XLSX.utils.json_to_sheet(phaseRows);
      const wsActivities = XLSX.utils.json_to_sheet(activityRows);
      
      XLSX.utils.book_append_sheet(wb, wsPhases, "Phase Template");
      XLSX.utils.book_append_sheet(wb, wsActivities, "Activity Template");
      
      XLSX.writeFile(wb, "Shoaibs_Fitness_Plan_Consolidated.xlsx");
      setExcelStatus({ type: 'success', text: "Successfully exported dual-sheet template!" });
    } catch (err: any) {
      setExcelStatus({ type: 'error', text: `Export failed: ${err.message}` });
    }
  };

  const handleImportSpreadsheet = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setExcelStatus(null);
    try {
      const XLSX = await loadXLSX();
      const reader = new FileReader();
      
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          
          // Sheet 1 (Phases/Activities)
          const phaseSheetName = wb.SheetNames[0];
          if (!phaseSheetName) throw new Error("No worksheets found in this workbook.");
          const phaseSheet = wb.Sheets[phaseSheetName];
          const phaseRawRows: any[] = XLSX.utils.sheet_to_json(phaseSheet);

          // Sheet 2 (Activities/Exercises)
          const activitySheetName = wb.SheetNames[1];
          let activityRawRows: any[] = [];
          if (activitySheetName) {
            const activitySheet = wb.Sheets[activitySheetName];
            activityRawRows = XLSX.utils.sheet_to_json(activitySheet);
          }

          const phaseMap: Record<string, Phase> = {};
          const activityMap: Record<string, Activity> = {};

          // Phase Template Mapping
          phaseRawRows.forEach(row => {
            const pId = String(row['Phase ID'] || '').trim();
            if (!pId) return;

            if (!phaseMap[pId]) {
              phaseMap[pId] = {
                id: pId,
                title: String(row['Phase Title'] || 'Untitled Phase'),
                isActive: String(row['Phase Is Active']).toLowerCase() !== 'false',
                items: []
              };
            }

            const itemNodeType = String(row['Item Node Type'] || '').trim();
            const itemId = String(row['Item ID'] || '').trim();

            if (itemNodeType === 'Activity' && itemId) {
              const act: Activity = {
                id: itemId,
                title: String(row['Activity Title'] || 'Day Plan'),
                name: String(row['Activity Name'] || 'Workout Routine'),
                overview: String(row['Activity Overview'] || ''),
                description: String(row['Item Description'] || ''),
                icon: String(row['Activity Icon'] || '🏋️'),
                colorTheme: String(row['Activity Color Theme'] || 'orange'),
                targetSessions: parseInt(row['Activity Target Sessions']) || 0,
                items: [],
                isActive: String(row['Item Is Active']).toLowerCase() !== 'false'
              };
              phaseMap[pId].items.push({ nodeType: 'Activity', data: act });
              activityMap[itemId] = act;
            } else if (itemNodeType === 'IndependentItem' && itemId) {
              const ind: IndependentItem = {
                id: itemId,
                type: (row['Item Type'] as any) || 'Note',
                title: String(row['Item Title'] || ''),
                description: String(row['Item Description'] || ''),
                isActive: String(row['Item Is Active']).toLowerCase() !== 'false'
              };
              phaseMap[pId].items.push({ nodeType: 'IndependentItem', data: ind });
            }
          });

          // Activity & Exercise Template Mapping
          activityRawRows.forEach(row => {
            const actId = String(row['Activity ID'] || '').trim();
            if (!actId || !activityMap[actId]) return;

            const targetAct = activityMap[actId];
            const itemNodeType = String(row['Item Node Type'] || '').trim();
            const itemId = String(row['Item ID'] || '').trim();

            if (itemNodeType === 'Exercise' && itemId) {
              // Parse highlights (Up to 4)
              const highlights: Highlight[] = [];
              for (let hIdx = 1; hIdx <= 4; hIdx++) {
                const name = row[`Highlight ${hIdx} Name` || `Highlight${hIdx}Name`];
                const value = row[`Highlight ${hIdx} Value` || `Highlight${hIdx}Value`];
                const icon = row[`Highlight ${hIdx} Icon` || `Highlight${hIdx}Icon`];
                if (name && value) {
                  highlights.push({
                    id: generateId(),
                    name: String(name),
                    value: String(value),
                    icon: String(icon || '🎯')
                  });
                }
              }

              const ex: Exercise = {
                id: itemId,
                type: String(row['Item Type']) === 'Instruction' ? 'Instruction' : 'Workout',
                title: String(row['Item Title'] || ''),
                name: String(row['Item Name'] || ''),
                description: String(row['Item Description'] || ''),
                howTo: String(row['Item How To'] || ''),
                note: String(row['Item Note'] || ''),
                images: row['Item Images'] ? String(row['Item Images']).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                highlightLayout: (row['Item Highlight Layout'] as any) || '3x1',
                priority: String(row['Item Priority']).toLowerCase() === 'true',
                isActive: String(row['Item Is Active']).toLowerCase() !== 'false',
                icon: String(row['Item Icon'] || '')
              };
              ex.highlights = highlights;

              targetAct.items.push({ nodeType: 'Exercise', data: ex });
            } else if (itemNodeType === 'IndependentItem' && itemId) {
              const ind: IndependentItem = {
                id: itemId,
                type: (row['Item Type'] as any) || 'Note',
                title: String(row['Item Title'] || ''),
                description: String(row['Item Description'] || ''),
                color: String(row['Item Color'] || 'orange'),
                icon: String(row['Item Icon'] || '💡'),
                isActive: String(row['Item Is Active']).toLowerCase() !== 'false'
              };
              targetAct.items.push({ nodeType: 'IndependentItem', data: ind });
            }
          });

          const importedPhases = Object.values(phaseMap);
          if (importedPhases.length === 0) throw new Error("No phase/activity rows were parsed correctly.");
          
          setPhases(importedPhases);
          setExcelStatus({ type: 'success', text: `Successfully imported ${importedPhases.length} Phases with Activities & Lifts!` });
        } catch (err: any) {
          setExcelStatus({ type: 'error', text: `Import parsing error: ${err.message}` });
        }
      };

      reader.readAsBinaryString(file);
    } catch (err: any) {
      setExcelStatus({ type: 'error', text: `Import Loader error: ${err.message}` });
    }
  };

  const activePhase = phases.find(p => p.id === activePhaseId);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 animate-in fade-in">
      {/* Top Bar for Builder */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="text-orange-500" size={24} />
            <h1 className="font-black text-xl tracking-tight hidden sm:block">Plan Builder</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Consolidated Excel Actions */}
            <button onClick={handleExportSpreadsheet} title="Export All Data to Excel Spreadsheet" className="px-3 py-2 bg-muted hover:bg-border text-foreground text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
              <Download size={14}/> Export Template
            </button>
            <button onClick={() => fileInputRef.current?.click()} title="Import Consolidated Spreadsheet" className="px-3 py-2 bg-muted hover:bg-border text-foreground text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
              <Upload size={14}/> Import Spreadsheet
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImportSpreadsheet} accept=".xlsx, .xls" className="hidden" />

            <button onClick={() => setViewMode('app')} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 text-sm">
              <Home size={16} /> Exit Builder
            </button>
          </div>
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
        {excelStatus && (
          <div className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${excelStatus.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="font-semibold">{excelStatus.text}</p>
          </div>
        )}

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

            {activePhase.items.map((node, actIdx) => {
              if (node.nodeType !== 'Activity') return null;
              const act = node.data;
              return (
                <div key={act.id} className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-muted p-4 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl bg-background p-2 rounded-xl shadow-sm">{act.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{act.name}</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{act.title}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 bg-background p-1 rounded-lg border border-border shadow-sm">
                      <button onClick={() => setPhases(prev => prev.map(p => p.id === activePhase.id ? { ...p, items: moveArrayItem(p.items, actIdx, -1) } : p))} disabled={actIdx === 0} className="p-1.5 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"><MoveUp size={16}/></button>
                      <button onClick={() => setPhases(prev => prev.map(p => p.id === activePhase.id ? { ...p, items: moveArrayItem(p.items, actIdx, 1) } : p))} disabled={actIdx === activePhase.items.length - 1} className="p-1.5 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"><MoveDown size={16}/></button>
                      <div className="w-px h-4 bg-border mx-1 my-auto"></div>
                      <button onClick={() => setModalConfig({ type: 'Activity', phaseId: activePhase.id, data: act })} className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Edit2 size={16}/></button>
                      <button onClick={() => deleteNode(activePhase.id, act.id)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-muted-foreground transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </div>

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
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => setPhases(prev => prev.map(p => p.id === activePhase.id ? { ...p, items: p.items.map(a => a.nodeType === 'Activity' && a.data.id === act.id ? { ...a, data: { ...a.data, items: moveArrayItem(a.data.items, itemIdx, -1) } } : a) } : p))} disabled={itemIdx === 0} className="p-1.5 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"><MoveUp size={14}/></button>
                          <button onClick={() => setPhases(prev => prev.map(p => p.id === activePhase.id ? { ...p, items: p.items.map(a => a.nodeType === 'Activity' && a.data.id === act.id ? { ...a, data: { ...a.data, items: moveArrayItem(a.data.items, itemIdx, 1) } } : a) } : p))} disabled={itemIdx === act.items.length - 1} className="p-1.5 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"><MoveDown size={14}/></button>
                          <button onClick={() => setModalConfig({ type: subItem.nodeType as 'Exercise'|'IndependentItem', phaseId: activePhase.id, activityId: act.id, data: subItem.data as any })} className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Edit2 size={14}/></button>
                          <button onClick={() => deleteNode(activePhase.id, act.id, subItem.data.id)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-muted-foreground transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                    
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

      {modalConfig?.type === 'Exercise' && (
        <ExerciseEditorModal 
          initialData={modalConfig.data} 
          onSave={saveExercise} 
          onClose={() => setModalConfig(null)} 
        />
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
    </div>
  );
}

// Extracted complex modal for Exercise to manage local state (images, uploads, highlights)
function ExerciseEditorModal({ initialData, onSave, onClose }: { initialData?: Exercise, onSave: (ex: Exercise) => void, onClose: () => void }) {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [queryName, setQueryName] = useState(initialData?.name || "");
  const [highlights, setHighlights] = useState<Highlight[]>(initialData?.highlights || []);
  const [mediaError, setMediaError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImage = (url: string) => { if (!images.includes(url)) setImages([...images, url]); };
  const removeImage = (idx: number) => { setImages(images.filter((_, i) => i !== idx)); };

  // ==========================================
  // MEDIA FILE UPLOAD HANDLER (< 5 MB)
  // ==========================================
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  setMediaError("");
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate size < 5 MB
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    setMediaError("File is too large! Maximum allowed size is 5 MB.");
    return;
  }

  // --- NEW BACKEND FETCH LOGIC FROM CANVAS ---
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${apiBase}/api/media/upload`, { 
      method: "POST", 
      body: formData 
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();
    // Save the permanent Supabase public cloud URL returned by the .NET API
    setImages(prev => [...prev, data.url]);
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
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/50 rounded-t-2xl">
          <h3 className="text-xl font-bold">{initialData?.id ? "Edit Exercise" : "New Exercise"}</h3>
          <button type="button" onClick={onClose} className="p-2 bg-muted rounded-full hover:bg-border transition-colors"><X size={16}/></button>
        </div>
        <div className="p-4 overflow-y-auto hide-scrollbar">
          <form id="ex-form" onSubmit={handleSubmit} className="space-y-6">
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
            
            {/* Multi-Source Image Search & Custom Media Upload */}
            <div className="border border-border rounded-xl p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Media Elements</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors flex items-center gap-1">
                    <Upload size={12}/> Upload (Max 5MB)
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />
                </div>
              </div>

              {mediaError && (
                <div className="p-2 mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                  <AlertCircle size={14} />
                  <span>{mediaError}</span>
                </div>
              )}

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
                {images.length === 0 && (
                  <div className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg text-[10px] text-muted-foreground">
                    <span>No media</span>
                  </div>
                )}
              </div>
              <ImageSearch currentName={queryName} onSelectImage={addImage} />
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>How To (Instructions)</label>
                <textarea name="howTo" defaultValue={initialData?.howTo} className={`${inputClass} min-h-[60px]`} placeholder="Form cues..." />
              </div>
              <div>
                <label className={labelClass}>Description / Notes</label>
                <textarea name="description" defaultValue={initialData?.description} className={`${inputClass} min-h-[60px]`} placeholder="Why are we doing this?" />
              </div>
              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800/40">
                <input type="checkbox" name="priority" defaultChecked={initialData?.priority} className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500" />
                <label className="text-sm font-bold text-amber-800 dark:text-amber-300">Mark as Priority / Essential (⭐)</label>
              </div>
            </div>

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
              {highlights.length === 0 && <p className="text-center text-xs text-muted-foreground py-2">No highlights added. Add reps, sets, or targets!</p>}
            </div>
          </form>
        </div>
        <div className="p-4 border-t border-border bg-muted/50 rounded-b-2xl flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-muted-foreground hover:bg-border rounded-lg transition-colors">Cancel</button>
          <button type="submit" form="ex-form" className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 shadow-sm transition-colors flex items-center gap-2"><Save size={16}/> Save Exercise</button>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// 6. WORKOUT TRACKER MODULE
// ==========================================
function WorkoutTracker() {
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
                       <p className={`text-xl font-black ${c.text}`}>{Math.round(reportLog.sessionValue * 100)}%</p>
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

// ==========================================
// 7. ACTIVE WORKOUT OVERLAY
// ==========================================
function ActiveWorkoutOverlay() {
  const { phases, activeWorkout, setActiveWorkout, workoutLogs, setWorkoutLogs } = useAppContext();
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  if (!activeWorkout) return null;

  const getActivityById = (id: string) => {
    for (const p of phases) { for (const item of p.items) { if (item.nodeType === 'Activity' && item.data.id === id) return item.data as Activity; } }
    return null;
  };

  const act = getActivityById(activeWorkout.activityId);
  if (!act) return null;

  const exercises = act.items.filter(i => i.nodeType === 'Exercise').map(i => i.data as Exercise);
  const total = exercises.length;
  const completedCount = activeWorkout.completedExerciseIds.length;
  const skippedCount = activeWorkout.skippedExerciseIds.length;
  const progressPct = total === 0 ? 0 : Math.round(((completedCount + skippedCount) / total) * 100);
  const calculatedSessionValue = total > 0 ? Number((completedCount / total).toFixed(2)) : 0;

  const handleExerciseAction = (exId: string, action: 'complete' | 'skip' | 'undo') => {
    setActiveWorkout(prev => {
      if(!prev) return null;
      let comp = prev.completedExerciseIds.filter(id => id !== exId);
      let skip = prev.skippedExerciseIds.filter(id => id !== exId);
      if (action === 'complete') comp.push(exId);
      if (action === 'skip') skip.push(exId);
      
      const newActive = { ...prev, completedExerciseIds: comp, skippedExerciseIds: skip };
      
      if (comp.length + skip.length === total && total > 0) {
        setTimeout(() => completeWorkout(newActive, 1), 500);
      }
      return newActive;
    });
  };

  const completeWorkout = (state: ActiveWorkout, sessionValue: number) => {
    setWorkoutLogs(prev => [...prev, {
      id: generateId(),
      activityId: state.activityId,
      date: state.dateStarted,
      completedExercises: state.completedExerciseIds,
      skippedExercises: state.skippedExerciseIds,
      sessionValue
    }]);
    setActiveWorkout(null);
  };

  if (activeWorkout.isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[500] bg-orange-500 text-white rounded-2xl shadow-2xl p-4 w-72 border-2 border-orange-300 animate-in slide-in-from-bottom-5">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold flex items-center gap-2"><Play size={16} fill="white"/> Workout Paused</h4>
          <button onClick={() => setActiveWorkout({...activeWorkout, isMinimized: false})} className="p-1 bg-black/20 rounded hover:bg-black/30"><Maximize2 size={14}/></button>
        </div>
        <p className="text-sm font-medium opacity-90 truncate mb-3">{act.name}</p>
        <div className="w-full bg-black/20 rounded-full h-2 mb-1">
          <div className="bg-white h-2 rounded-full progress-strip" style={{ width: `${progressPct}%` }}></div>
        </div>
        <p className="text-[10px] font-bold text-right">{progressPct}%</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] bg-background flex flex-col animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-card border-b border-border p-4 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-md">
            <Play size={20} fill="white" />
          </div>
          <div>
            <h2 className="font-black text-xl leading-tight text-foreground">{act.name}</h2>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">{act.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowConfirmDiscard(true)} className="px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 font-bold rounded-lg text-sm transition-colors">Discard</button>
          <button onClick={() => setShowConfirmEnd(true)} className="px-3 py-2 bg-orange-100 text-orange-600 hover:bg-orange-200 font-bold rounded-lg text-sm transition-colors">End Early</button>
          <button onClick={() => setActiveWorkout({...activeWorkout, isMinimized: true})} className="p-2 bg-muted text-foreground hover:bg-border rounded-lg transition-colors" title="Minimize"><Minimize2 size={20}/></button>
        </div>
      </div>

      <div className="bg-muted px-6 py-3 border-b border-border shadow-inner">
        <div className="flex justify-between items-end mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progress</span>
          <span className="text-sm font-black text-foreground">{completedCount + skippedCount} / {total}</span>
        </div>
        <div className="w-full bg-border rounded-full h-3 overflow-hidden">
          <div className="bg-orange-500 h-full progress-strip shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 space-y-6 max-w-3xl mx-auto w-full">
        {exercises.map((ex, i) => {
          const isDone = activeWorkout.completedExerciseIds.includes(ex.id);
          const isSkip = activeWorkout.skippedExerciseIds.includes(ex.id);
          const isHandled = isDone || isSkip;
          
          return (
            <div key={ex.id} className={`bg-card border-2 rounded-2xl p-5 shadow-sm transition-all duration-300 ${isDone ? 'border-green-400 bg-green-50/10' : isSkip ? 'border-border opacity-60 grayscale bg-muted/20' : 'border-orange-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task {i+1}</span>
                  <h3 className={`text-xl font-bold mt-1 ${isHandled ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{ex.name}</h3>
                </div>
                <div className="flex flex-col gap-2 shrink-0 ml-4">
                  {isHandled ? (
                    <button onClick={() => handleExerciseAction(ex.id, 'undo')} className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold hover:bg-muted transition-colors flex items-center gap-1"><RotateCcw size={12}/> Undo</button>
                  ) : (
                    <>
                      <button onClick={() => handleExerciseAction(ex.id, 'complete')} className="px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5"><CheckCircle2 size={16}/> Done</button>
                      <button onClick={() => handleExerciseAction(ex.id, 'skip')} className="px-4 py-1.5 bg-muted text-muted-foreground hover:text-foreground rounded-lg text-xs font-bold transition-colors">Skip</button>
                    </>
                  )}
                </div>
              </div>
              
              {!isHandled && (
                <>
                  {ex.howTo && <p className="text-sm text-foreground/80 mb-4 bg-muted/50 p-3 rounded-lg leading-relaxed">{ex.howTo}</p>}
                  {ex.highlights && ex.highlights.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {ex.highlights.map(h => (
                        <div key={h.id} className="bg-background border border-border p-2 rounded-lg text-center shadow-sm">
                          <span className="block text-[10px] font-bold text-muted-foreground uppercase">{h.name}</span>
                          <span className="block text-sm font-black text-foreground mt-0.5">{h.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {ex.images && ex.images.length > 0 && (
                    <div className="h-48 w-full bg-muted rounded-xl overflow-hidden border border-border">
                       {isVideoUrl(ex.images[0]) ? (
                         <video src={ex.images[0]} controls loop muted playsInline className="w-full h-full object-cover" />
                       ) : (
                         <img src={ex.images[0]} className="w-full h-full object-cover" alt="Guide"/>
                       )}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {showConfirmEnd && (
        <ConfirmModal 
          title="End Workout Early?" 
          message={`You have completed ${completedCount} out of ${total} exercises. This will log as a partial (${calculatedSessionValue}) session. Do you want to end?`} 
          onConfirm={() => completeWorkout(activeWorkout, calculatedSessionValue)} 
          onCancel={() => setShowConfirmEnd(false)} 
        />
      )}

      {showConfirmDiscard && (
        <ConfirmModal 
          title="Discard Workout?" 
          message="Are you sure you want to discard this workout? No session data will be saved." 
          onConfirm={() => { setActiveWorkout(null); setShowConfirmDiscard(false); }} 
          onCancel={() => setShowConfirmDiscard(false)} 
        />
      )}
    </div>
  );
}

// ==========================================
// 8. VIEWER MODULE (Main App Interface)
// ==========================================
function MainViewer() {
  const { phases, setViewMode, activeTab, setActiveTab } = useAppContext();
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openPhase, setOpenPhase] = useState(phases[0]?.id || "");
  const { theme, setTheme } = useTheme();

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
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-10 h-10 flex items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-border transition-colors shadow-sm" title="Toggle Light/Dark Mode">
          {theme === "dark" ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
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

      <ActiveWorkoutOverlay />
    </div>
  );
}

function ViewerActivity({ activity }: { activity: Activity }) {
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

function TargetIcon() { return <Target size={16} /> }

function ViewerExercise({ exercise, index }: { exercise: Exercise, index: number }) {
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

function ViewerIndependentItem({ item }: { item: IndependentItem }) {
  if (item.type === 'Header') {
    return <div id={item.id} className="pt-4 pb-2 border-b border-border section-anchor"><h3 className="text-xl font-bold text-foreground">{item.title}</h3></div>;
  }
  if (item.type === 'Note') {
    const c = themeColors[item.color || 'orange'] || themeColors.orange;
    return (
      <div id={item.id} className={`section-anchor bg-card rounded-2xl border border-card-border shadow-sm p-6 flex gap-4 ${c.bg}`}>
        {item.icon && <span className="text-3xl flex-shrink-0">{item.icon}</span>}
        <div>
          {item.title && <h3 className={`font-bold text-lg mb-1 ${c.text}`}>{item.title}</h3>}
          {item.description && <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{item.description}</p>}
        </div>
      </div>
    );
  }
  if (item.type === 'Highlights') {
    return (
      <div id={item.id} className={`section-anchor grid gap-3 ${item.highlightLayout === '3x1' ? 'grid-cols-3' : item.highlightLayout === '1x2' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {item.highlights?.map(h => (
          <div key={h.id} className="bg-card border border-card-border shadow-sm rounded-xl p-4 flex flex-col items-center text-center">
            {h.icon && <span className="text-2xl mb-2">{h.icon}</span>}
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{h.name}</span>
            <span className="text-base font-bold text-foreground mt-1">{h.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function App() {
  const [viewMode, setViewMode] = useState<'app' | 'builder'>('app');
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'tracker'>('plan');

  return (
    <ThemeProviderWrapper>
      <GlobalStyles />
      <AppContext.Provider value={{ viewMode, setViewMode, phases, setPhases, workoutLogs, setWorkoutLogs, activeWorkout, setActiveWorkout, activeTab, setActiveTab }}>
        {viewMode === 'app' ? <MainViewer /> : <BuilderDashboard />}
      </AppContext.Provider>
    </ThemeProviderWrapper>
  );
}