import { supabase } from "@/src/features/lib/supabase";

export const skinService = {
  // ... existing saveAnalysisRecord code ...

  /**
   * Fetches scan history for a specific user with nested conditions
   */
async getUserHistory() {
    try {
      const { data, error } = await supabase
        .from('tbl_skin_result')
        .select(`
          *,
          tbl_skin_conditions (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  }
};