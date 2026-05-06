import { supabase } from "../../lib/supabase";
import { UsersSkinResult } from "../types/UsersSkinResult";

export const userSkinResultService = {
  
  /**
   * 1. UPLOAD IMAGE TO STORAGE
   * Uploads local file to 'skin-scans' bucket and returns Public URL
   */
  async uploadSkinImage(userId: string, imageUri: string) {
    try {
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: fileName,
        type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      } as any);

      const { error: uploadError } = await supabase.storage
        .from('skin-scans') // Ensure this bucket is created in Supabase & marked PUBLIC
        .upload(filePath, formData);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('skin-scans')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Storage Upload Error:", error);
      return null;
    }
  },

  /**
   * 2. CREATE DATABASE RECORD
   */
  async createUserSkinResult(profileId: string, analysis: UsersSkinResult) {
    const { data, error } = await supabase
      .from('tbl_users_skin_result')
      .insert([{
        score: analysis.score,
        confidence: analysis.confidence,
        skin_type: analysis.skinType,
        overall_severity: analysis.severity, 
        image_url: analysis.imageUri, // This will be the HTTPS URL
        profile_id: profileId
      }])
      .select()
      .single();

    if (error) throw error;

    // Save individual condition detections
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

  /**
   * 3. GET HISTORY
   */
  async getUserSkinHistory(profileId: string) {
    const { data, error } = await supabase
      .from('tbl_users_skin_result')
      .select(`
        *,
        tbl_users_skin_result_condition (*)
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};