// src/hooks/useFidelityStats.js
import { useState, useEffect } from 'react';
import { getFidelityStatistics } from '../services/memberStatisticsService';

export const useFidelityStats = (selectedClass) => {
  const [fidelityData, setFidelityData] = useState(null);
  const [loadingFidelity, setLoadingFidelity] = useState(false);

  useEffect(() => {
    if (!selectedClass) return;

    setLoadingFidelity(true);
    getFidelityStatistics(selectedClass)
      .then((data) => setFidelityData(data))
      .catch(console.error)
      .finally(() => setLoadingFidelity(false));
  }, [selectedClass]);

  return { fidelityData, loadingFidelity };
};
