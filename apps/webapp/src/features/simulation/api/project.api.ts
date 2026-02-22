import { api } from '@/lib/api-client';
import type { Project, ProjectTeamMember, Deliverable } from '../types/simulation.types';

export interface ProjectListItem {
  id: string;
  name: string;
  client: string | null;
  sector: string;
  description: string | null;
  initialBudget: number;
  currentBudget: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  simulation: { id: string; status: string; currentPhaseOrder: number } | null;
  _count: { teamMembers: number; deliverables: number };
}

export const projectApi = {
  getProjects: () => api.get<ProjectListItem[]>('/projects'),
  getProject: (id: string) => api.get<Project & { simulation: any }>(`/projects/${id}`),
  getTeam: (id: string) => api.get<ProjectTeamMember[]>(`/projects/${id}/team`),
  getDeliverables: (id: string) => api.get<Deliverable[]>(`/projects/${id}/deliverables`),
  updateDeliverable: (projectId: string, delId: string, data: { status?: string; progress?: number }) =>
    api.patch<Deliverable>(`/projects/${projectId}/deliverables/${delId}`, data),
};
