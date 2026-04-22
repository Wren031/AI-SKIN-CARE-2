import { useEffect, useState } from 'react';

import { supabase } from '@/src/features/lib/supabase';
import { skinService } from '../services/skinService';

export const useSkinHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ scans: 0, avgHealth: 0, alerts: 0 });

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const data = await skinService.getUserHistory();
        setHistory(data || []);
        
        // Calculate Summary Stats
        if (data && data.length > 0) {
          const avg = data.reduce((acc: number, curr: any) => acc + curr.score, 0) / data.length;
          const highSeverity = data.filter((item: any) => 
            item.overall_severity.toLowerCase() === 'severe' || item.overall_severity.toLowerCase() === 'high'
          ).length;

          setStats({
            scans: data.length,
            avgHealth: Math.round(avg),
            alerts: highSeverity
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return { history, isLoading, stats, refresh: fetchHistory };
};