import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { fetchFullRecommendations } from '../services/recommendationService';

export const useRecommendations = (detections: any[]) => {
  const [advice, setAdvice] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadAllData = async () => {
      if (!detections || detections.length === 0) {
        setAdvice([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data: conditions, error: condError } = await supabase
          .from('tbl_condition')
          .select('id, name');

        if (condError) throw condError;
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
          const data = await fetchFullRecommendations(formatted as { id: number; severity: string }[]);
          setAdvice(data);
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
  }, [JSON.stringify(detections)]);

  return { advice, loading };
};