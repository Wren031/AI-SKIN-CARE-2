import { useCallback, useEffect, useMemo, useState } from 'react';
import { progressService } from '../services/progressService';
import { Progress } from '../types/Progress';

export type FilterType = 'Monthly' | 'Bi-Weekly';

export const useSkinProgress = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('Monthly');
  const [data, setData] = useState({
    raw: [] as Progress[],
    total: 0,
    currentScore: 0,
    scoreDiff: 0, // Bag-o nga field
    daysRemaining: 0 as number | null,
  });

  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true);
      const user = await progressService.getCurrentUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const result = await progressService.fetchSkinResults(user.id);
      setData({
        raw: result.entries,
        total: result.totalCount,
        currentScore: result.currentScore,
        scoreDiff: result.scoreDiff, // I-save ang difference gikan sa service
        daysRemaining: result.daysRemaining,
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
  const currentMonthIndex = new Date().getMonth();

  if (filter === 'Monthly') {
    return months.map((m, index) => {
      // Filter entries para sa specific nga bulan
      const entriesInMonth = data.raw.filter(
        d => new Date(d.created_at).getMonth() === index
      );

      let score = 0;

      if (entriesInMonth.length > 0) {
        // Kuhaon ang score sa pinaka-uwahi nga scan sa maong bulan
        score = entriesInMonth[entriesInMonth.length - 1].score;
      } 
      
      // FIX: Kung kini nga bulan mao ang "Current Month" ug naay currentScore, 
      // siguraduhon nato nga 94 ang mugawas (currentScore gikan sa service)
      if (index === currentMonthIndex && data.currentScore > 0) {
        score = data.currentScore;
      }

      return { 
        value: score, 
        label: m,
        // Optional: Ayaw i-show ang label kung zero ang score para limpyo ang chart
        showLabel: score > 0 
      };
    });
  }

  // Bi-Weekly logic stays the same
  return data.raw.map(item => ({
    value: item.score,
    label: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));
}, [filter, data.raw, data.currentScore]);

  return { 
    ...data, 
    loading, 
    filter, 
    setFilter, 
    chartData, 
    refresh: loadProgressData 
  };
};