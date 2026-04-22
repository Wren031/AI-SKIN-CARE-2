import { THEMES } from '@/src/constants/themes';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { skinService } from '../services/skinService';
import { AnalysisResult, SeverityStyle } from '../types/analysis';

const COLORS = THEMES.DERMA_AI.COLORS;

export const useSkinAnalysis = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  const analysis: AnalysisResult = {
    score: (params.score as string) || '0',
    confidence: (params.confidence as string) || '0',
    skinType: (params.skinType as string) || 'Unknown',
    severity: (params.severity as string) || 'Normal',
    imageUri: params.imageUri as string,
    detections: params.detections ? JSON.parse(params.detections as string) : [],
  };

  const getSeverityStyles = (sev: string): SeverityStyle => {
    const label = String(sev || '').toLowerCase();
    if (['severe', 'deep', 'critical', 'high'].includes(label)) 
      return { color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.1)', status: 'SEVERE' }; 
    if (['moderate', 'visible', 'medium'].includes(label)) 
      return { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)', status: 'MODERATE' }; 
    return { color: COLORS.SUCCESS, bg: COLORS.SUCCESS + '15', status: 'MILD' };   
  };

  const handleExit = () => router.replace('/(tabs)/home');
  
  const handleShowRecommendations = async () => {
    try {
      setIsSaving(true);

      // 1. Get the current logged-in user ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // 2. Save the analysis record using the found ID
      await skinService.saveAnalysisRecord(user.id, analysis);
      
      // 3. Navigate to recommendations
      router.push({
        pathname: '/recommendation' as any, 
        params: { detections: JSON.stringify(analysis.detections) },
      });
    } catch (error) {
      console.error("Failed to process protocol:", error);
      alert("Could not save report. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    analysis,
    isSaving,
    getSeverityStyles,
    handleExit,
    handleShowRecommendations,
  };
};