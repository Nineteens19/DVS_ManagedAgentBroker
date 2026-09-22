import { MockDataEngine } from './mockDataEngine';
import { AgentApplicationDetailDto, ApplicationListItemDto, SlaDashboardMetricsDto } from '../types/domain';

const DIRECT_MOCK_MODE = true;

/**
 * High-Performance API Client with Instant Mock Engine Support
 */
export const apiClient = {
  getApplications: async (role?: string, branchCode?: string): Promise<ApplicationListItemDto[]> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.getApplications(role, branchCode);
    }
    const response = await fetch('/api/applications');
    return await response.json();
  },

  getApplicationById: async (id: string): Promise<AgentApplicationDetailDto | null> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.getApplicationById(id);
    }
    const response = await fetch(`/api/applications/${id}`);
    return await response.json();
  },

  saveDraft: async (data: Partial<AgentApplicationDetailDto>): Promise<AgentApplicationDetailDto> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.saveDraft(data);
    }
    const response = await fetch('/api/applications/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  submitApplication: async (id: string): Promise<AgentApplicationDetailDto> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.submitApplication(id);
    }
    const response = await fetch(`/api/applications/${id}/submit`, { method: 'POST' });
    return await response.json();
  },

  runComplianceScreen: async (id: string): Promise<AgentApplicationDetailDto> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.runComplianceScreen(id);
    }
    const response = await fetch(`/api/compliance/screen/${id}`, { method: 'POST' });
    return await response.json();
  },

  forwardToExecutive: async (id: string, notes?: string): Promise<AgentApplicationDetailDto> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.forwardToExecutive(id, notes);
    }
    const response = await fetch(`/api/approval/${id}/forward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    return await response.json();
  },

  recordDeficiency: async (id: string, reason: string): Promise<AgentApplicationDetailDto> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.recordDeficiency(id, reason);
    }
    const response = await fetch(`/api/approval/${id}/deficiency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return await response.json();
  },

  approveApplication: async (
    id: string,
    approvedLimit?: number,
    commissionPct?: number,
    notes?: string
  ): Promise<AgentApplicationDetailDto> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.approveApplication(id, approvedLimit, commissionPct, notes);
    }
    const response = await fetch(`/api/approval/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedLimit, commissionPct, notes }),
    });
    return await response.json();
  },

  rejectApplication: async (id: string, reason: string): Promise<AgentApplicationDetailDto> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.rejectApplication(id, reason);
    }
    const response = await fetch(`/api/approval/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return await response.json();
  },

  retryProvisioning: async (id: string, targetSystem: string): Promise<AgentApplicationDetailDto> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.retryProvisioning(id, targetSystem);
    }
    const response = await fetch(`/api/provisioning/${id}/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetSystem }),
    });
    return await response.json();
  },

  archiveContract: async (
    id: string,
    boxNumber: string,
    notes?: string
  ): Promise<AgentApplicationDetailDto> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.archiveContract(id, boxNumber, notes);
    }
    const response = await fetch(`/api/archive/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boxNumber, notes }),
    });
    return await response.json();
  },

  getSlaMetrics: async (): Promise<SlaDashboardMetricsDto> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.getSlaMetrics();
    }
    const response = await fetch('/api/sla/metrics');
    return await response.json();
  },

  triggerDaemonSimulation: async (action: 'check30D' | 'check90D' | 'resetDemo'): Promise<void> => {
    if (DIRECT_MOCK_MODE) {
      return await MockDataEngine.triggerDaemonSimulation(action);
    }
    await fetch('/api/daemon/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
  },
};
