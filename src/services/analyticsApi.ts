import type { AnalyticsMetric, AnalyticsSummary } from '../types';
import { apiRequest } from './apiClient';

export const analyticsApi = {
  async metrics(): Promise<{ metrics: AnalyticsMetric[]; summary: AnalyticsSummary }> {
    return apiRequest<{ metrics: AnalyticsMetric[]; summary: AnalyticsSummary }>('/analytics/metrics');
  },
};
