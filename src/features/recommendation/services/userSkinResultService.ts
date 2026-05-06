import { useState } from "react";
import { supabase } from "../../lib/supabase";

import { userSkinResultService } from "../hooks/useUserSkinResult";
import { UsersSkinResult } from "../types/UsersSkinResult";

export const useUserSkinResult = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReport = async (analysis: UsersSkinResult) => {
    try {
      setIsSaving(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required.");

      let finalImageUrl = analysis.imageUri;

      // Logic: Only upload if it is a local file path
      if (analysis.imageUri?.startsWith('file://') || analysis.imageUri?.startsWith('content://')) {
        const uploadedUrl = await userSkinResultService.uploadSkinImage(user.id, analysis.imageUri);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          throw new Error("Failed to upload scan image to the cloud.");
        }
      }

      // Final step: Save to DB with the cloud URL
      const result = await userSkinResultService.createUserSkinResult(
        user.id,
        { ...analysis, imageUri: finalImageUrl }
      );

      return result;
    } catch (err: any) {
      console.error("Hook Save Error:", err);
      setError(err.message || "An unexpected error occurred while saving.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      return await userSkinResultService.getUserSkinHistory(user.id);
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createReport,
    fetchHistory,
    isSaving,
    isLoading,
    error
  };
};