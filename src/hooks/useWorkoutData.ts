import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FitnessAPI } from '../services/fitnessApi';

export const useWorkoutData = () => {
  const [phases, setPhases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchWorkoutData();
  }, []);

  const fetchWorkoutData = async () => {
    try {
      setIsLoading(true);
      // Example Supabase fetch - will be migrated to .NET later
      const { data, error: dbError } = await supabase.from('phases').select('*');
      if (dbError) throw dbError;
      setPhases(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe Session Completion (Fixes Bug 4 Setup)
  const completeSession = async (activityId: string, sessionData: any) => {
    try {
      // Logic to append a NEW session record rather than overwriting
      // This logic will be fully implemented in the .NET controller in Phase 4
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    phases,
    isLoading,
    error,
    completeSession,
    uploadMedia: FitnessAPI.uploadMedia
  };
};