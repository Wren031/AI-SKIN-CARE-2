import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { authService } from "../services/AuthServices";
import { Authentication } from "../type/Authentication";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const login = async (authData: Authentication) => {
    const { email, password } = authData;

    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return null;
    }

    setLoading(true);
    try {
      const data = await authService.login(authData);
      Alert.alert("Success", "Login successful!");
      return data;
    } catch (error: any) {
      Alert.alert("Error", error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const data = await authService.signInWithGoogle();
      return data;
    } catch (error: any) {
      Alert.alert("Google Error", error.message);
      return null;
    } finally {
      setLoading(false); 
    }
  };

  const signUp = async (authData: Authentication) => {
    const { email, password } = authData;

    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return null;
    }

    setLoading(true);
    try {
      const data = await authService.signUp(authData);
      Alert.alert("Success", "Account created!");
      return data;
    } catch (error: any) {
      Alert.alert("Error", error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, token: string) => {
    if (!token) {
      Alert.alert("Error", "Please enter the verification code");
      return null;
    }

    setLoading(true);
    try {
      const data = await authService.verifyOTP(email, token);
      Alert.alert("Success", "Email verified successfully!");
      return data;
    } catch (error: any) {
      Alert.alert("Verification Failed", error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        router.replace("/"); 
        
      } catch (error: any) {
        Alert.alert("Logout Failed", error.message);
      } finally {
        setLoading(false);
      }
    };

  return {
    verifyEmail,
    login,
    signUp,
    logout,
    signInWithGoogle,
    loading,
    setLoading,     
  };
};