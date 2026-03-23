import { useCallback, useState } from 'react';
import { profileService } from '../services/ProfileService';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const user = await profileService.getCurrentUser();
      if (!user) return null;

      const data = await profileService.getProfile(user.id);
      if (data) {
        setProfile(data);
        return data;
      }
    } catch (error: any) {
      console.error("Fetch Profile Error:", error.message);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);


  const saveFullProfile = async (form: any) => {
    setLoading(true);
    try {
      const user = await profileService.getCurrentUser();
      if (!user) throw new Error("User session not found");

      let finalAvatarUrl = form.avatar_url;

      // Only upload if it's a local file URI
      if (form.avatar_url?.startsWith('file://') || form.avatar_url?.startsWith('content://')) {
        const uploadedUrl = await profileService.uploadAvatar(user.id, form.avatar_url);
        if (uploadedUrl) finalAvatarUrl = uploadedUrl;
      }

      // We remove avatar_url from the spread if it's the default icon 
      // to avoid saving a placeholder URL to the DB if you prefer
      const success = await profileService.updateProfile(user.id, {
        ...form,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString(),
      });

      // Refresh local state after successful save
      if (success) {
        setProfile({ ...form, avatar_url: finalAvatarUrl });
      }

      return success;
    } catch (error: any) {
      console.error("Save Profile Error:", error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    fetchProfile,
    saveFullProfile,
    loading
  };
};