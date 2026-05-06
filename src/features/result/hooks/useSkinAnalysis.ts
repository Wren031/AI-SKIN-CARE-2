import { THEMES } from '@/src/constants/themes';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Severity, UsersSkinResult } from '../../recommendation/types/UsersSkinResult';
import { SeverityStyle } from '../types/analysis';

const COLORS = THEMES.DERMA_AI.COLORS;

export const useSkinAnalysis = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  // Helper to ensure severity matches the union type
  const parseSeverity = (sev: string | undefined): Severity => {
    const s = String(sev || '').toUpperCase();
    if (['SEVERE', 'DEEP', 'CRITICAL', 'HIGH'].includes(s)) return 'SEVERE';
    if (['MODERATE', 'VISIBLE', 'MEDIUM'].includes(s)) return 'MODERATE';
    return 'MILD';
  };

  const analysis: UsersSkinResult = {
    score: parseInt(params.score as string, 10) || 0,
    confidence: parseInt(params.confidence as string, 10) || 0,
    skinType: (params.skinType as string) || 'Unknown',
    severity: parseSeverity(params.severity as string),
    imageUri: params.imageUri as string,
    detections: params.detections ? JSON.parse(params.detections as string) : [],
  };

  const getSeverityStyles = (sev: Severity | string): SeverityStyle => {
    const label = String(sev || '').toUpperCase();
    
    if (label === 'SEVERE') 
      return { color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.1)', status: 'SEVERE' }; 
    if (label === 'MODERATE') 
      return { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)', status: 'MODERATE' }; 
    
    return { color: COLORS.SUCCESS, bg: COLORS.SUCCESS + '15', status: 'MILD' };   
  };

  const handleExit = () => router.replace('/(tabs)/home');

  const handleShowRecommendations = async () => {
      try {
        setIsSaving(true);
        router.push({
          pathname: '/recommendation' as any, 
          params: { 
            detections: JSON.stringify(analysis.detections),
            skinType: analysis.skinType,
            score: analysis.score.toString(),
            severity: analysis.severity,
            skin_result_id: 'temp_preview_id', 
          },
        });
      } catch (error) {
        console.error("Failed to navigate to recommendations:", error);
        alert("Could not load recommendations. Please try again.");
      } finally {
        setIsSaving(false);
      }
    };

  return {
    analysis,
    isSaving,
    getSeverityStyles,
    handleExit,
    handleShowRecommendations
  };
};