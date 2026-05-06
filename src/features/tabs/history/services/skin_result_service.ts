import { supabase } from "@/src/features/lib/supabase";
import { users_skin_result } from "../types/users_skin_result";

export const skin_result_service = {

  async get_skin_result(profileId: string): Promise<users_skin_result[]> {
    const { data, error } = await supabase
      .from("tbl_users_skin_result")
      .select("id, created_at, score, skin_type, overall_severity, image_url, confidence")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) throw error;
 
    return (data ?? []).map((item) => ({
      id: item.id,
      created_at: item.created_at,
      score: item.score ?? 0,
      skin_type: item.skin_type ?? "Unknown",
      severity: item.overall_severity ?? "Normal", 
      imageUrl: item.image_url,
      confidence: item.confidence ?? 0,
    }));
  },

  async delete_skin_result(id: number): Promise<void> {
    const { error } = await supabase
      .from("tbl_users_skin_result")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async delete_all_result(profileId: string): Promise<void> {
  const { error } = await supabase
    .from("tbl_users_skin_result")
    .delete()
    .eq("profile_id", profileId);

  if (error) throw error;
}
};