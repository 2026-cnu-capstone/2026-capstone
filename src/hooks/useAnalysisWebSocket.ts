/**
 * 분석 실시간 이벤트 WebSocket 훅
 */

import { useEffect, useRef, useCallback } from 'react';

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export interface WsStepEvent {
  type: 'step_started' | 'step_completed';
  step_index: number;
  total: number;
  step_name: string;
  agent_name: string;
  status?: string;
  output?: string;
  elapsed?: string;
  dfxml_fragment?: string;
}

export interface WsStrategyEvent {
  type: 'strategy_ready';
  strategy: string;
  system_profile?: string;
}

export interface WsPlanEvent {
  type: 'plan_ready';
  plan_text: string;
  steps: Array<{
    index: number;
    name: string;
    mcp_server: string;
    purpose: string;
    artifacts: string[];
    hints: string;
  }>;
}

export interface WsExecutionDoneEvent {
  type: 'execution_done';
  task_results: Array<Record<string, unknown>>;
}

export interface WsReportEvent {
  type: 'report_ready';
  summary: string;
  report: string;
  dfxml: string;
}

export type WsEvent =
  | WsStepEvent
  | WsStrategyEvent
  | WsPlanEvent
  | WsExecutionDoneEvent
  | WsReportEvent
  | { type: 'error'; message: string };

interface UseAnalysisWebSocketOptions {
  caseId: string | null;
  onEvent: (event: WsEvent) => void;
}

export function useAnalysisWebSocket({ caseId, onEvent }: UseAnalysisWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!caseId) return;
    const ws = new WebSocket(`${WS_BASE}/api/analysis/ws/${caseId}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WsEvent;
        onEventRef.current(data);
      } catch {
        /* ignore parse errors */
      }
    };

    ws.onclose = () => {
      /* auto-reconnect after 3s */
      setTimeout(() => {
        if (wsRef.current === ws) {
          connect();
        }
      }, 3000);
    };

    wsRef.current = ws;
  }, [caseId]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return { disconnect };
}
