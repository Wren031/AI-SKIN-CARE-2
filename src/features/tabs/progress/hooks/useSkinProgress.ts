import { useCallback, useEffect, useMemo, useState } from 'react';
import { progressService } from '../services/progressService';
import { Progress } from '../types/Progress';

export type FilterType = 'Monthly' | 'Yearly';

export const useSkinProgress = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('Monthly');
  const [data, setData] = useState({
    raw: [] as Progress[],
    total: 0,
    currentScore: 0,
    scoreDiff: 0,
    daysRemaining: null as number | null,
  });

  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true);
      const user = await progressService.getCurrentUser();
      if (!user) return;

      const result = await progressService.fetchSkinResults(user.id);
      
      // --- LOGIC: Calculate Next Assessment (14 days from last scan) ---
      let daysLeft = null;
      if (result.entries.length > 0) {
        const lastScan = [...result.entries].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        const lastScanDate = new Date(lastScan.created_at);
        const nextScanDate = new Date(lastScanDate);
        nextScanDate.setDate(lastScanDate.getDate() + 14); // Add 14 days
        
        const today = new Date();
        const diffTime = nextScanDate.getTime() - today.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      setData({
        raw: result.entries,
        total: result.totalCount,
        currentScore: result.currentScore, // This is already the latest from your service
        scoreDiff: result.scoreDiff,
        daysRemaining: daysLeft,
      });
    } catch (e) {
      console.error("[useSkinProgress] Error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const chartData = useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    if (filter === 'Monthly') {
      return months.map((m, index) => {
        const entriesInMonth = data.raw.filter(d => new Date(d.created_at).getMonth() === index);
        let score = 0;
        if (entriesInMonth.length > 0) {
          const sorted = [...entriesInMonth].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          score = sorted[sorted.length - 1].score;
        }
        return { value: score, label: m };
      });
    }

    return [...data.raw]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((item) => {
        const date = new Date(item.created_at);
        return { value: item.score, label: `${date.getDate()} ${months[date.getMonth()]}` };
      });
  }, [filter, data.raw]);

  return { ...data, loading, filter, setFilter, chartData, refresh: loadProgressData };
};