
import { supabase } from '../../lib/supabase';
import { AnalysisResult, SkinDetection } from '../types/analysis';

export const skinService = {
  
  async saveAnalysisRecord(userId: string, analysis: AnalysisResult) {
    const { data: result, error: resErr } = await supabase
      .from('tbl_skin_result')
      .insert([{
        user_id: userId,
        score: parseFloat(analysis.score),
        confidence: parseFloat(analysis.confidence),
        skin_type: analysis.skinType,
        overall_severity: analysis.severity,
        image_url: analysis.imageUri
      }])
      .select().single();
    if (resErr) throw resErr;

    if (analysis.detections?.length > 0) {
      const conditions = analysis.detections.map((det: SkinDetection) => ({
        result_id: result.id,
        label: det.label,
        severity: det.severity,
        impact: det.impact
      }));
      const { error: condErr } = await supabase.from('tbl_skin_conditions').insert(conditions);
      if (condErr) throw condErr;
    }
    return result;
  },

  async getUserHistory(userId: string) {
    const { data, error } = await supabase
      .from('tbl_skin_result')
      .select('*, tbl_skin_conditions(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};