'use client';

import { useState } from 'react';

export interface DashboardSummary {
  // Health cards
  liveProjects: number;
  totalPortfolioArv: number;
  totalMortgages: number;
  totalPrivateInvestment: number;
  totalCurrentInvestment: number;
  totalAccruedInterest: number;
  totalDistributed: number;
  netEquity: number;
  weightedLeverage: number;
  expiringIn90Days: number;
  // Risk
  leverageExceedsThreshold: boolean;
  // Charts
  projectsByStatus: Record<string, number>;
  projectsByCompany: Record<string, number>;
  leverageEquity: { address: string; leverage: number; equity: number }[];
  // Timeline
  timelineExpirations: { date: string; note: string; amount: number }[];
  // Table
  tableRows: { id: string; created_at: string; company: string; investor: string; project: string }[];
}

export function useDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSummary = async (): Promise<DashboardSummary | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Failed to fetch dashboard summary');
        return null;
      }
      const data: DashboardSummary = await res.json();
      return data;
    } catch (e: any) {
      setError(e.message || 'Network error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getSummary, loading, error };
}
