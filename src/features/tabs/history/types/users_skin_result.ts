export interface users_skin_result {
  id: number;
  created_at: string;
  score: number;
  skin_type: string;
  severity: string;
  image_url?: string | null;
  confidence: number;
  profile_id?: string;
}