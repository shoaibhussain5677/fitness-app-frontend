import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Phase, WorkoutLog, ActiveWorkout } from '../types';
import { FitnessAPI } from '../services/fitnessApi';

// ==========================================
// 1. HELPER FUNCTIONS
// ==========================================
const generateId = () => Math.random().toString(36).substring(2, 9);

const createHighlights = (sets: string, reps: string, rest: string) => [
  { id: generateId(), name: "Sets", value: sets, icon: "🔄" }, 
  { id: generateId(), name: "Reps", value: reps, icon: "🎯" }, 
  { id: generateId(), name: "Rest", value: rest, icon: "⏱️" }
];

const createTargetHold = (target: string, hold: string) => [
  { id: generateId(), name: "Target", value: target, icon: "🎯" }, 
  { id: generateId(), name: "Hold", value: hold, icon: "⏱️" }
];

// ==========================================
// 2. INITIAL DATA (FALLBACK)
// ==========================================
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
// 3. TYPES & CONTEXT DEFINITIONS
// ==========================================
type AppContextType = {
  viewMode: 'app' | 'builder'; setViewMode: (m: 'app' | 'builder') => void;
  phases: Phase[]; setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
  workoutLogs: WorkoutLog[]; setWorkoutLogs: React.Dispatch<React.SetStateAction<WorkoutLog[]>>;
  activeWorkout: ActiveWorkout | null; setActiveWorkout: React.Dispatch<React.SetStateAction<ActiveWorkout | null>>;
  activeTab: 'plan' | 'tracker'; setActiveTab: (t: 'plan' | 'tracker') => void;
};

// ----------------------------------------------------
// EXPORTS
// ----------------------------------------------------
export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("Missing AppContext");
  return ctx;
}

// ==========================================
// 4. PROVIDER COMPONENT (With Database Auto-Save)
// ==========================================
export function AppProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<'app' | 'builder'>('app');
  const [phases, setPhases] = useState<Phase[]>(initialPhases); 
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'tracker'>('plan');
  const [isLoaded, setIsLoaded] = useState(false);

  // FETCH FROM DATABASE ON LOAD
  useEffect(() => {
    FitnessAPI.getProgram().then(data => {
      if (data && data.length > 0) {
        setPhases(data); // Overwrite hardcoded data with Database data!
      }
      setIsLoaded(true);
    }).catch(err => {
      console.error("Database empty or offline. Falling back to default plan.", err);
      setIsLoaded(true);
    });
  }, []);

  // AUTO-SAVE TO DATABASE
  useEffect(() => {
    if (!isLoaded) return;
    
    // We "debounce" the save so it waits 1.5 seconds after you finish typing
    // to avoid spamming your API with requests!
    const timer = setTimeout(() => {
      FitnessAPI.syncProgram(phases)
        .then(() => console.log("✅ Auto-saved to Supabase Database"))
        .catch(console.error);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [phases, isLoaded]);

  return (
    <AppContext.Provider value={{ 
      viewMode, setViewMode, 
      phases, setPhases, 
      workoutLogs, setWorkoutLogs, 
      activeWorkout, setActiveWorkout, 
      activeTab, setActiveTab 
    }}>
      {children}
    </AppContext.Provider>
  );
}