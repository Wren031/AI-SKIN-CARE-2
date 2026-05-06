import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { userSkinResultService } from "../services/userSkinResultService";
import { UsersSkinResult } from "../types/UsersSkinResult";

export const useUserSkinResult = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReport = async (analysis: UsersSkinResult) => {
    try {
      setIsSaving(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("User authentication required to save results.");
      }

      const result = await userSkinResultService.createUserSkinResult(
        user.id,
        analysis
      );

      return result;
    } catch (err: any) {
      const message = err.message || "Failed to save report";
      console.error("Error saving report:", err);
      setError(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const fetchUserHistory = async (profileId: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // FIX: Call the service function and pass user.id
      const history = await userSkinResultService.getUserSkinHistory(user.id);
      return history;
    } catch (err: any) {
      setError(err.message || "Failed to fetch history");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // --- DELETE ---
  const removeReport = async (resultId: string) => {
    try {
      setIsSaving(true);
      setError(null);

      await userSkinResultService.deleteSkinResult(resultId);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete report");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    createReport,
    fetchUserHistory,
    removeReport,
    isSaving,
    isLoading,
    error,
  };
};