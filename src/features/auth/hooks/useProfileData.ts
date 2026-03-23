import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react'; // Added useEffect
import { profileService } from '../services/ProfileService';

export const useProfileData = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const user = await profileService.getCurrentUser();
      
      if (!user) {
        router.replace('/');
        return;
      }

      const data = await profileService.getProfile(user.id);

      if (!data || !data.first_name) {
        router.replace('/setup-profile');
        return;
      }

      setProfile(data);
    } catch (error: any) {
      console.error("Profile Fetch Error:", error.message);
      router.replace('/setup-profile');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, refresh: fetchProfile };
};