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
      // This now works because we are using the /legacy import
      const base64 = await FileSystem.readAsStringAsync(imageUri, { 
        encoding: FileSystem.EncodingType.Base64 
      });

      const filePath = `${userId}/${Date.now()}.png`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), { 
          contentType: 'image/png',
          upsert: true 
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (e) {
      console.error("Upload error:", e);
      return null;
    }
  },


  // async updateProfile(id: string, data: Partial<User>): Promise<User> {
  //     const { data: updatedData, error } = await supabase
  //       .from('tbl_profiles')
  //       .update({
  //         first_name: data.first_name,
  //         middle_name: data.middle_name,
  //         last_name: data.last_name,
  //         suffix: data.suffix,
  //         avatar_url: data.avatar_url,
  //         date_of_birth: data.date_of_birth, 
  //         gender: data.gender,
  //         phone_number: data.phone_number,
  //         address: data.address,
  //         updated_at: new Date().toISOString(),
  //       })
  //       .eq('id', id)
  //       .select()
  //       .single();

  //     if (error) throw error;
  //     return updatedData as User;
  //   },

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


};