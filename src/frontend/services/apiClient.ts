import { MockDataEngine } from './mockDataEngine';
import { AgentApplicationDetailDto, ApplicationListItemDto, SlaDashboardMetricsDto } from '../types/domain';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const USE_DEMO_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== 'false';

/**
 * Hybrid Dual-Mode API Client with Transparent Fallback to In-Memory Engine
 */
export const apiClient = {
  getApplications: async (role?: string, branchCode?: string): Promise<ApplicationListItemDto[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(1500)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      if (USE_DEMO_FALLBACK) {
        return await MockDataEngine.getApplications(role, branchCode);
      }
      throw new Error('Backend API unavailable');
    }
  },

  getApplicationById: async (id: string): Promise<AgentApplicationDetailDto | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(1500)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      if (USE_DEMO_FALLBACK) {
        return await MockDataEngine.getApplicationById(id);
      }
      throw new Error('Backend API unavailable');
    }
  },

  saveDraft: async (data: Partial<AgentApplicationDetailDto>): Promise<AgentApplicationDetailDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(2000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      if (USE_DEMO_FALLBACK) {
        return await MockDataEngine.saveDraft(data);
      }
      throw new Error('Backend API unavailable');
    }
  },

  submitApplication: async (id: string): Promise<AgentApplicationDetailDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      if (USE_DEMO_FALLBACK) {
        return await MockDataEngine.submitApplication(id);
      }
      throw new Error('Backend API unavailable');
    }
  },

  runComplianceScreen: async (id: string): Promise<AgentApplicationDetailDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/compliance/screen/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      if (USE_DEMO_FALLBACK) {
        return await MockDataEngine.runComplianceScreen(id);
      }
      throw new Error('Backend API unavailable');
    }
  },

  forwardToExecutive: async (id: string, notes?: string): Promise<AgentApplicationDetailDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/approval/${id}/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
        signal: AbortSignal.timeout(2000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      if (USE_DEMO_FALLBACK) {
        return await MockDataEngine.forwardToExecutive(id);
      }
      throw new Error('Backend API unavailable');
    }
  },

  processExecutiveDecision: async (id: string, isApproved: boolean, remarks: string): Promise<AgentApplicationDetailDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/approval/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved, decisionNotes: remarks }),
        signal: AbortSignal.timeout(2000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      if (USE_DEMO_FALLBACK) {
        return await MockDataEngine.processExecutiveDecision(id, isApproved, remarks);
      }
      throw new Error('Backend API unavailable');
    }
  },

  triggerProvisioning: async (id: string, approvedLimit: number, commissionPercentage: number): Promise<AgentApplicationDetailDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/provisioning/${id}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedCreditLimit: approvedLimit, commissionPercentage }),
        signal: AbortSignal.timeout(3000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      if (USE_DEMO_FALLBACK) {
        return await MockDataEngine.triggerProvisioning(id, approvedLimit, commissionPercentage);
      }
      throw new Error('Backend API unavailable');
    }
  },

  archivePhysicalContract: async (id: string, boxNumber: string, notes?: string): Promise<AgentApplicationDetailDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/archive/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archiveBoxNumber: boxNumber, legalAuditorNotes: notes }),
        signal: AbortSignal.timeout(2000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      if (USE_DEMO_FALLBACK) {
        return await MockDataEngine.archivePhysicalContract(id, boxNumber, notes);
      }
      throw new Error('Backend API unavailable');
    }
  },

  getSlaMetrics: async (): Promise<SlaDashboardMetricsDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sla/metrics`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(1500)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      if (USE_DEMO_FALLBACK) {
        return await MockDataEngine.getSlaMetrics();
      }
      throw new Error('Backend API unavailable');
    }
  }
};
