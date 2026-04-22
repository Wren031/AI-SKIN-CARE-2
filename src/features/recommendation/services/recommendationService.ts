import { supabase } from "../../lib/supabase";

export const fetchFullRecommendations = async (formattedDetections: { id: number; severity: string }[]) => {
  if (!formattedDetections || formattedDetections.length === 0) return [];

  // 1. Construct the filter string
  const filterList = formattedDetections.map(d => 
    `and(condition_id.eq.${d.id},severity.eq.${d.severity})`
  );

  const { data, error } = await supabase
    .from('tbl_recommendations')
    .select(`
      id,
      severity,
      treatment,
      precautions,
      tbl_condition!condition_id (
        name
      ),
      tbl_recommendation_products (
        tbl_products!product_id (
          id,
          product_name, 
          image_url,
          brand
        )
      )
    `)
    .or(filterList.join(','));

  if (error) {
    console.error("Supabase Join Error:", error.message);
    throw error;
  }

  return data;
};