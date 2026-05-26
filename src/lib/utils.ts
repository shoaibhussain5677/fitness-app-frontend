export const generateId = () => Math.random().toString(36).substring(2, 9);
export const getLocalISODate = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];

export const isVideoUrl = (url: string) => {
  if (!url) return false;
  return url.startsWith("data:video/") || url.includes("#video") || url.includes(".mp4") || url.includes(".webm") || url.includes(".mov");
};

export const EMOJIS = [
  { char: "🏋️", keywords: "weight lift gym push strength" }, { char: "🦵", keywords: "leg glutes lower body" }, { char: "💪", keywords: "arm flex pull bicep back" }, { char: "⚡", keywords: "energy lightning fast cardio full" }, { char: "🏊", keywords: "swim water pool cardio" }, { char: "🧘", keywords: "stretch yoga mobility routine" }, { char: "🏃", keywords: "run sprint cardio active" }, { char: "🚶", keywords: "walk active recovery stroll" }, { char: "😴", keywords: "sleep rest bed night" }, { char: "🔄", keywords: "sync refresh loop cycle recovery" }, { char: "🎯", keywords: "target aim goal reps sets" }, { char: "⏱️", keywords: "timer clock time rest hold" }, { char: "⚠️", keywords: "warning alert note danger" }, { char: "💡", keywords: "idea bulb tip note highlight" }, { char: "📌", keywords: "pin attach item point" }, { char: "🏠", keywords: "home house alternative" }, { char: "🥩", keywords: "meat protein food beef" }, { char: "🍚", keywords: "rice carbs food grain" }, { char: "🥑", keywords: "avocado fats food healthy" }, { char: "💧", keywords: "water drop hydration drink" }, { char: "🔥", keywords: "fire burn intense hot" }, { char: "🚫", keywords: "stop block avoid no" }
];

export const themeColors: Record<string, { bg: string, text: string, border: string, gradient: string }> = {
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/40', gradient: 'from-orange-500 to-red-500' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/40', gradient: 'from-blue-500 to-cyan-600' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800/40', gradient: 'from-red-500 to-pink-600' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800/40', gradient: 'from-yellow-500 to-orange-500' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800/40', gradient: 'from-green-500 to-emerald-600' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/40', gradient: 'from-purple-500 to-indigo-600' },
};