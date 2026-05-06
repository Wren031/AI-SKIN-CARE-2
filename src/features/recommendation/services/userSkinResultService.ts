import { supabase } from "../../lib/supabase";
import { UsersSkinResult } from "../types/UsersSkinResult";

export const userSkinResultService = {
  
  // --- CREATE ---
  async createUserSkinResult(profileId: string, analysis: UsersSkinResult) {
    const { data, error } = await supabase
      .from('tbl_users_skin_result')
      .insert([{
        score: analysis.score,
        confidence: analysis.confidence,
        skin_type: analysis.skinType,
        overall_severity: analysis.severity, 
        image_url: analysis.imageUri,     
        profile_id: profileId
      }])
      .select()
      .single();

    if (error) throw error;

    if (analysis.detections && analysis.detections.length > 0) {
      const conditions = analysis.detections.map((det) => ({
        skin_result_id: data.id,
        label: det.label,
        severity: det.severity,
        impact: det.impact
      }));

      const { error: condErr } = await supabase
        .from('tbl_users_skin_result_condition')
        .insert(conditions);

      if (condErr) throw condErr;
    }

    return data;
  },

  // --- READ (Get All Results for a User) ---
  async getUserSkinHistory(profileId: string) {
    const { data, error } = await supabase
      .from('tbl_users_skin_result')
      .select(`
        *,
        tbl_users_skin_result_condition (*)
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching history:", error.message);
      throw error;
    }
    return data;
  },

  // --- READ (Get Single Result Detail) ---
  async getSkinResultById(resultId: string) {
    const { data, error } = await supabase
      .from('tbl_users_skin_result')
      .select(`
        *,
        tbl_users_skin_result_condition (*)
      `)
      .eq('id', resultId)
      .single();

    if (error) throw error;
    return data;
  },

  // --- DELETE ---
  async deleteSkinResult(resultId: string) {
    // Note: If you have Foreign Key constraints with CASCADE DELETE 
    // in Supabase, this will automatically remove entries in 
    // tbl_users_skin_result_condition and tbl_users_recommendation.
    const { data, error } = await supabase
      .from('tbl_users_skin_result')
      .delete()
      .eq('id', resultId);

    if (error) {
      console.error("Error deleting result:", error.message);
      throw error;
    }
    return data;
  }
};