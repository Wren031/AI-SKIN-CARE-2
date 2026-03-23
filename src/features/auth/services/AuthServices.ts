import { supabase } from "../../lib/supabase";
import { Authentication } from "../type/Authentication";


export const authService = {

  async login({ email, password }: Authentication) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      throw error;
    }

    return data;
  },

  async signUp({ email, password }: Authentication) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data?.user) {
      const { error: profileError } = await supabase
        .from("tbl_profiles")
        .insert([{ id: data.user.id }]);
      
      if (profileError) {
        console.error("Profile creation error:", profileError.message);
      }
    }
    return data;
  },

  async signInWithGoogle() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },

          redirectTo: 'http://localhost:8081', 
        },
      });

      if (error) throw error;
      return data;
    },

  async verifyOTP(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (error) {
      console.error("Verification error:", error.message);
      throw error;
    }

    return data;
  },
};