import { supabase } from "../../lib/supabase";

export const recommendationService = {


  fetchFullRecommendations: async (
    formattedDetections: { id: number; severity: string }[]
  ) => {
    if (!formattedDetections || formattedDetections.length === 0) return [];

    const orFilters = formattedDetections
      .map((d) => `and(condition_id.eq.${d.id},severity.eq.${d.severity})`)
      .join(",");

    const { data, error } = await supabase
      .from("tbl_recommendations")
      .select(`
        id,
        severity,
        treatment,
        precautions,
        created_at,
        tbl_condition (id, name, created_at),
        tbl_recommendation_products (
          tbl_products (*)
        ),
        tbl_recommendation_lifestyle_tips (
          tbl_lifestyle_tips (*)
        )
      `)
      .or(orFilters);

    if (error) {
      console.error("Supabase Query Error:", error.message);
      throw error;
    }

    return data;
  },

  async saveUsersRecommendations(
    recommendationId: number, 
    productId: number | null, 
    lifestyleTipId: number | null,
    profileId: string, 
    skinResultId: number
  ) {
    const { data, error } = await supabase
      .from('tbl_users_recommendation')
      .insert([{
        recommendation_id: recommendationId,
        product_id: productId,
        lifestyle_id: lifestyleTipId,
        profile_id: profileId,
        skin_result_id: skinResultId,
         created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};