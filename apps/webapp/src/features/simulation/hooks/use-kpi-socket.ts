import { useEffect } from 'react';
import { useSocket } from '@/providers/socket-provider';
import type { KpiValues } from '../types/simulation.types';

export function useKpiSocket(
  simulationId: string,
  onUpdate: (kpis: KpiValues) => void,
) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handler = (data: any) => {
      if (data.simulationId === simulationId) {
        onUpdate(data.kpis);
      }
    };

    socket.on('kpi:updated', handler);
    return () => {
      socket.off('kpi:updated', handler);
    };
  }, [socket, simulationId, onUpdate]);
}
