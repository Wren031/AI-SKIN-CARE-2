
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from "../../lib/supabase";

export const profileService = {

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async uploadAvatar(userId: string, imageUri: string) {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, { 
        encoding: FileSystem.EncodingType.Base64 
      });

      const filePath = `${userId}/${Date.now()}.png`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), { 
          contentType: 'image/png',
          upsert: true 
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (e) {
      console.error("Upload error:", e);
      return null;
    }
  },

  async updateProfile(userId: string, profileData: any) {
    const { error } = await supabase
      .from('tbl_profiles')
      .upsert({ 
        id: userId, 
        ...profileData, 
        updated_at: new Date() 
      });

    if (error) throw error;
    return true;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('tbl_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); 

    if (error) throw error;
    return data; 
  },

  // ✅ NEW: helper to directly get profile_id
  async getProfileId() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("User not logged in");

    const profile = await this.getProfile(user.id);
    if (!profile) throw new Error("Profile not found");

    return profile.id; // this is your profile_id
  }
};