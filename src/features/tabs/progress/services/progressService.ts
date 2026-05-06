import { supabase } from "@/src/features/lib/supabase";
import { Progress } from "../types/Progress";

export const progressService = {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  },

async fetchSkinResults(userId: string) {
  const { data, error, count } = await supabase
    .from('tbl_users_skin_result')
    .select('score, created_at', { count: 'exact' })
    .eq('profile_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const entries = (data || []) as Progress[];
  
  if (entries.length === 0) {
    return { entries: [], totalCount: 0, currentScore: 0, scoreDiff: 0, daysRemaining: 0 };
  }

  const lastEntry = entries[entries.length - 1];
  
  // --- KINI ANG SAKTONG CALCULATION PARA SA +2 ---
  // Imbes nga entries[length-2], mangita ta og entry gikan sa PREVIOUS MONTH
  const currentMonth = new Date(lastEntry.created_at).getMonth();
  const currentYear = new Date(lastEntry.created_at).getFullYear();

  // Filter entries para sa tanan gawas sa current month, unya kuhaa ang pinaka-latest
  const pastEntries = entries.filter(e => {
    const d = new Date(e.created_at);
    return d.getMonth() !== currentMonth || d.getFullYear() !== currentYear;
  });

  const previousMonthEntry = pastEntries.length > 0 ? pastEntries[pastEntries.length - 1] : null;

  // 94 (Current) - 92 (Last Month) = +2
  const scoreDiff = previousMonthEntry 
    ? lastEntry.score - previousMonthEntry.score 
    : 0;

  // --- Days Remaining Logic ---
  let daysRemaining = 0;
  const nextScanDate = new Date(lastEntry.created_at);
  nextScanDate.setDate(nextScanDate.getDate() + 14);
  const diff = nextScanDate.getTime() - new Date().getTime();
  daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

  return {
    entries,
    totalCount: count || 0,
    currentScore: lastEntry.score,
    scoreDiff, // Mao na ni ang mugawas nga +2
    daysRemaining,
  };
}
};