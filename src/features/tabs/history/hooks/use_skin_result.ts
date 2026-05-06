import { profileService } from "@/src/features/auth/services/ProfileService";
import { useCallback, useState } from "react";

import { skin_result_service } from "../services/skin_result_service";
import { users_skin_result } from "../types/users_skin_result";

export const use_skin_result = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserHistory = useCallback(async (): Promise<users_skin_result[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const profileId = await profileService.getProfileId();

      if (!profileId) {
        throw new Error("User profile not found. Please log in again.");
      }

      const data = await skin_result_service.get_skin_result(profileId)
      return data;
    } catch (err: any) {
      const message = err.message || "An unknown error occurred";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);


  const removeReport = async (id: number): Promise<boolean> => {
    try {
      await skin_result_service.delete_skin_result(id);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete the report");
      return false;
    }
  };

  const deleteAllReports = async (): Promise<boolean> => {
  try {
    const profileId = await profileService.getProfileId();

    if (!profileId) {
      throw new Error("User profile not found.");
    }

    await skin_result_service.delete_all_result(profileId);
    return true;
  } catch (err: any) {
    setError(err.message || "Failed to delete all reports");
    return false;
  }
};

return {
  fetchUserHistory,
  removeReport,
  deleteAllReports,
  isLoading,
  error,
};
};