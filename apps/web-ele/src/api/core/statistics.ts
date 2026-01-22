import { requestClient } from '#/api/request';

export namespace StatisticsApi {
  export interface TrendData {
    date: string;
    count: number;
    amount: null | number;
  }

  export interface TrendResponse {
    type: string;
    trendData: TrendData[];
    totalCount: number;
    totalAmount: null | number;
    averageGrowthRate: number;
  }

  export interface CrossAnalysisData {
    type: string;
    crossData: Record<string, Record<string, number>>;
    totalCount: number;
    statusDistribution: Record<string, number>;
    progressDistribution: Record<string, number>;
  }

  export interface RankingItem {
    rank: number;
    id: number;
    name: string;
    amount: number;
    percentage: number;
  }

  export interface RankingResponse {
    type: string;
    sortBy: string;
    topN: number;
    rankings: RankingItem[];
    totalAmount: number;
  }

  export interface CaseStatisticsData {
    totalCases: number;
    pendingCases: number;
    inProgressCases: number;
    approvedCases: number;
    completedCases: number;
    closedCases: number;
    terminatedCases: number;
    archivedCases: number;
    statusDistribution: Record<string, number>;
    progressDistribution: Record<string, number>;
    simplifiedTrialCases: number;
    normalTrialCases: number;
    averageReviewCount: number;
    todayCreatedCases: number;
    monthCreatedCases: number;
    yearCreatedCases: number;
  }

  export interface CreditorClaimStatisticsData {
    totalClaims: number;
    pendingClaims: number;
    registeredClaims: number;
    rejectedClaims: number;
    statusDistribution: Record<string, number>;
    claimTypeDistribution: Record<string, number>;
    claimNatureDistribution: Record<string, number>;
    totalPrincipalAmount: number;
    totalInterestAmount: number;
    totalPenaltyAmount: number;
    totalOtherLossesAmount: number;
    totalClaimAmount: number;
    averageClaimAmount: number;
    todayCreatedClaims: number;
    monthCreatedClaims: number;
    yearCreatedClaims: number;
    hasCourtJudgmentClaims: number;
    hasExecutionClaims: number;
    hasCollateralClaims: number;
  }
}

export const getCaseTrend = (params: { period?: string }) => {
  return requestClient.get<StatisticsApi.TrendResponse>(
    '/api/v1/statistics/case/trend',
    {
      params,
    },
  );
};

export const getCaseCrossAnalysis = () => {
  return requestClient.get<StatisticsApi.CrossAnalysisData>(
    '/api/v1/statistics/case/cross-analysis',
  );
};

export const getCaseAmountRanking = (params: { topN?: number }) => {
  return requestClient.get<StatisticsApi.RankingResponse>(
    '/api/v1/statistics/case/amount-ranking',
    { params },
  );
};

export const getCaseStatistics = (params?: {
  caseProgress?: string;
  caseStatus?: string;
  courtId?: number;
  endDate?: string;
  startDate?: string;
}) => {
  return requestClient.get<StatisticsApi.CaseStatisticsData>(
    '/api/v1/case-statistics',
    {
      params,
    },
  );
};

export const getCreditorClaimStatistics = (params?: {
  caseId?: number;
  claimNature?: string;
  claimType?: string;
  endDate?: string;
  registrationStatus?: string;
  startDate?: string;
}) => {
  return requestClient.get<StatisticsApi.CreditorClaimStatisticsData>(
    '/creditor-claim-statistics',
    { params },
  );
};

export const getCreditorClaimAmountRanking = (params: { topN?: number }) => {
  return requestClient.get<StatisticsApi.RankingResponse>(
    '/api/v1/statistics/creditor-claim/amount-ranking',
    { params },
  );
};
