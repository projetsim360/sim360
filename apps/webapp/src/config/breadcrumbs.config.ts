export interface BreadcrumbSegment {
  label: string;
  path?: string;
}

export interface BreadcrumbDef {
  segments: BreadcrumbSegment[];
}

export const BREADCRUMB_CONFIG: Record<string, BreadcrumbDef> = {
  '/simulations/:id': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName' },
    ],
  },
  '/simulations/:id/pmo': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
      { label: 'Agent PMO' },
    ],
  },
  '/simulations/:id/emails': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
      { label: 'Emails' },
    ],
  },
  '/simulations/:id/deliverables': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
      { label: 'Livrables' },
    ],
  },
  '/simulations/:id/deliverables/:delId/edit': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
      { label: 'Livrables', path: '/simulations/:id/deliverables' },
      { label: 'Redaction' },
    ],
  },
  '/simulations/:id/deliverables/:delId/evaluation': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
      { label: 'Livrables', path: '/simulations/:id/deliverables' },
      { label: 'Evaluation' },
    ],
  },
  '/simulations/:id/kpis': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
      { label: 'Historique KPI' },
    ],
  },
  '/simulations/:id/timeline': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
      { label: 'Timeline' },
    ],
  },
  '/simulations/:id/debriefing': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
      { label: 'Debriefing' },
    ],
  },
  '/simulations/:id/portfolio': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
      { label: 'Portfolio' },
    ],
  },
  '/simulations/:id/cv-suggestions': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
      { label: 'Suggestions CV' },
    ],
  },
  '/simulations/:id/intranet': {
    segments: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
      { label: 'Intranet' },
    ],
  },
  '/projects/:id': {
    segments: [
      { label: 'Projets', path: '/projects' },
      { label: ':projectName' },
    ],
  },
  '/projects/:id/team': {
    segments: [
      { label: 'Projets', path: '/projects' },
      { label: ':projectName', path: '/projects/:id' },
      { label: 'Equipe' },
    ],
  },
  '/recruitment/campaigns/:id': {
    segments: [
      { label: 'Recrutement', path: '/recruitment/campaigns' },
      { label: ':campaignTitle' },
    ],
  },
  '/recruitment/campaigns/:id/shortlist': {
    segments: [
      { label: 'Recrutement', path: '/recruitment/campaigns' },
      { label: ':campaignTitle', path: '/recruitment/campaigns/:id' },
      { label: 'Shortlist' },
    ],
  },
  '/recruitment/campaigns/:id/compare': {
    segments: [
      { label: 'Recrutement', path: '/recruitment/campaigns' },
      { label: ':campaignTitle', path: '/recruitment/campaigns/:id' },
      { label: 'Comparaison' },
    ],
  },
  '/recruitment/campaigns/:id/candidates/:candidateId': {
    segments: [
      { label: 'Recrutement', path: '/recruitment/campaigns' },
      { label: ':campaignTitle', path: '/recruitment/campaigns/:id' },
      { label: 'Rapport candidat' },
    ],
  },
  '/recruitment/campaigns/:id/candidates/:candidateId/interview': {
    segments: [
      { label: 'Recrutement', path: '/recruitment/campaigns' },
      { label: ':campaignTitle', path: '/recruitment/campaigns/:id' },
      { label: 'Guide entretien' },
    ],
  },
};
