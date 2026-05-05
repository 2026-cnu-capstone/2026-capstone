/**
 * Backend API 클라이언트
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API Error ${res.status}: ${err}`);
  }
  return res.json();
}

export interface AnalysisStartRequest {
  case_id: string;
  disk_image_path: string;
  prompt: string;
}

export interface StrategyApprovalRequest {
  approved: boolean;
  feedback?: string;
}

export interface PlanApprovalRequest {
  approved: boolean;
  feedback?: string;
}

export interface StrategyResponse {
  strategy: string;
  system_profile: string | null;
}

export interface PlanResponse {
  plan_text: string;
  steps: Array<{
    index: number;
    name: string;
    mcp_server: string;
    purpose: string;
    artifacts: string[];
    hints: string;
  }>;
  plan_ready?: boolean;
}

export interface ReportResponse {
  summary: string;
  report: string;
  dfxml: string;
}

export const api = {
  startAnalysis: (data: AnalysisStartRequest) =>
    request<StrategyResponse>('/api/analysis/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approveStrategy: (caseId: string, data: StrategyApprovalRequest) =>
    request<PlanResponse & { strategy?: string }>(`/api/analysis/${caseId}/strategy/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approvePlan: (caseId: string, data: PlanApprovalRequest) =>
    request<PlanResponse | { approved: boolean }>(`/api/analysis/${caseId}/plan/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  executeAnalysis: (caseId: string) =>
    request<{ status: string; total_steps: number }>(`/api/analysis/${caseId}/execute`, {
      method: 'POST',
    }),

  generateReport: (caseId: string) =>
    request<ReportResponse>(`/api/analysis/${caseId}/report`, {
      method: 'POST',
    }),

  pauseAnalysis: (caseId: string) =>
    request<{ status: string }>(`/api/analysis/${caseId}/pause`, {
      method: 'POST',
    }),

  getStatus: (caseId: string) =>
    request<{ exists: boolean; phase?: string; plan_steps_count?: number; task_results_count?: number }>(
      `/api/analysis/${caseId}/status`
    ),

  getCases: () =>
    request<Array<Record<string, unknown>>>('/api/cases'),

  createCase: (data: { name: string; description?: string }) =>
    request<Record<string, unknown>>('/api/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteCase: (caseId: string) =>
    request<void>(`/api/cases/${caseId}`, {
      method: 'DELETE',
    }),
};
