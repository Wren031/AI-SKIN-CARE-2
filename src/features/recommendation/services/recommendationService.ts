import { supabase } from "../../lib/supabase";

export const fetchFullRecommendations = async (
  formattedDetections: { id: number; severity: string }[]
) => {
  if (!formattedDetections || formattedDetections.length === 0) return [];

  const orFilters = formattedDetections
    .map(
      (d) => `and(condition_id.eq.${d.id},severity.eq.${d.severity})`
    )
    .join(",");

  const { data, error } = await supabase
    .from("tbl_recommendations")
    .select(`
      id,
      severity,
      treatment,
      precautions,
      created_at,

      tbl_condition (
        id,
        name,
        created_at
      ),

      tbl_recommendation_products (
        tbl_products (
          id,
          product_name,
          type,
          price,
          image_url,
          instructions,
          usage
        )
      ),

      tbl_recommendation_lifestyle_tips (
        tbl_lifestyle_tips (
          id,
          category,
          title,
          description
        )
      )
    `)
    .or(orFilters);

  if (error) {
    console.error("Supabase Query Error:", error.message);
    throw error;
  }

  return data;
};