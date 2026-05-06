import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { recommendationService } from '../services/recommendationService';

export const useRecommendations = (detections: any[]) => {
  const [advice, setAdvice] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const detectionKey = JSON.stringify(detections);

  useEffect(() => {
    const loadAllData = async () => {
      if (!detections || detections.length === 0) {
        setAdvice([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 1. Fetch master conditions to get IDs
        const { data: conditions, error: condError } = await supabase
          .from('tbl_condition')
          .select('id, name');

        if (condError) throw condError;

        // 2. Map AI detections to Database IDs
        const formatted = detections.map(d => {
          const matchedCondition = conditions.find(
            c => c.name.toLowerCase() === d.label.replace('_', ' ').toLowerCase()
          );
          
          return {
            id: matchedCondition ? matchedCondition.id : null,
            severity: d.severity.charAt(0).toUpperCase() + d.severity.slice(1).toLowerCase()
          };
        }).filter(d => d.id !== null);

        if (formatted.length > 0) {
          const data = await recommendationService.fetchFullRecommendations(formatted as any);
          setAdvice(data || []);
        } else {
          setAdvice([]);
        }
      } catch (err) {
        console.error("Error in useRecommendations hook:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [detectionKey]);

  const saveUsersRecommendations = async (
    recommendationId: number, 
    productId: number, 
    lifestyleTipId: number, 
    profileId: string, 
    skinResultId: number
  ) => {
    try {
      const result = await recommendationService.saveUsersRecommendations(
        recommendationId, 
        productId, 
        lifestyleTipId, 
        profileId, 
        skinResultId
      );
      return result;
    } catch (err) {
      console.error("Error saving user recommendations:", err);
      throw err;
    }
  };

  return { advice, loading, saveUsersRecommendations };
};