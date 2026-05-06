import { supabase } from '@/src/features/lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import { user_recommendation_service } from '../services/user_recommendation_service';

export const use_user_recommendation = (profile_id?: string) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const fetchHistory = useCallback(async () => {
    if (!profile_id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await user_recommendation_service.get_recommendation_by_id(profile_id);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch skin history');
    } finally {
      setIsLoading(false);
    }
  }, [profile_id]);

  /**
   * Remove a single record locally and on DB
   */
  const removeReport = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tbl_users_recommendation')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setData((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('[useUserRecommendation] Delete error:', err);
      return false;
    }
  };

  /**
   * Clear entire history for a profile
   */
  const deleteAllReports = async (): Promise<boolean> => {
    if (!profile_id) return false;
    try {
      const { error } = await supabase
        .from('tbl_users_recommendation')
        .delete()
        .eq('profile_id', profile_id);

      if (error) throw error;

      setData([]);
      return true;
    } catch (err) {
      console.error('[useUserRecommendation] Clear all error:', err);
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchHistory,
    removeReport,
    deleteAllReports
  };
};