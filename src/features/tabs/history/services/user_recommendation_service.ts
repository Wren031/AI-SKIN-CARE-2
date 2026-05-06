import { supabase } from "@/src/features/lib/supabase";

export const user_recommendation_service = {
  async get_recommendation_by_id(ida: string): Promise<any | null> {
    try {
      const numericId = parseInt(ida, 10);
      
      const { data, error } = await supabase
        .from('tbl_users_recommendation')
        .select(`
          *,
          recommendation:recommendation_id (
            *,
            recommendation_products:tbl_recommendation_products (
              product:product_id (*)
            ),
            recommendation_lifestyle_tips:tbl_recommendation_lifestyle_tips (
              lifestyle:lifestyle_tip_id (*)
            )
          ),
          skin_result:skin_result_id (
            *,
            conditions:tbl_users_skin_result_condition (*)
          )
        `)
        .eq('skin_result_id', numericId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("[Service] Error fetching recommendation details:", error);
      throw error;
    }
  }
};