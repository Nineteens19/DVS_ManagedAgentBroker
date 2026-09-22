# Component Methods & API Contracts — Agent & Broker Management System

This document specifies the method signatures, input parameters, and return types for all core component interfaces.

---

## 1. Application Intake & Management (`IApplicationIntakeService`)

```csharp
namespace ManagedAgentBroker.Application.Interfaces
{
    public interface IApplicationIntakeService
    {
        // Creates a new draft application (Form F-CM-035 & F-CM-018)
        Task<ApplicationDraftResponse> CreateDraftAsync(
            CreateApplicationDraftCommand command, 
            CancellationToken ct = default);

        // Updates existing draft application details
        Task<ApplicationDraftResponse> UpdateDraftAsync(
            Guid applicationId, 
            UpdateApplicationDraftCommand command, 
            CancellationToken ct = default);

        // Uploads and associates an encrypted supporting document
        Task<AttachmentUploadResponse> UploadAttachmentAsync(
            Guid applicationId, 
            UploadAttachmentCommand command, 
            CancellationToken ct = default);

        // Submits an application from Branch BU to Head Office BU review
        Task<ApplicationStatusResponse> SubmitToHeadOfficeAsync(
            Guid applicationId, 
            CancellationToken ct = default);

        // Head Office reviews and issues a reject checklist back to branch
        Task<ApplicationStatusResponse> RejectToChecklistAsync(
            Guid applicationId, 
            RejectChecklistCommand command, 
            CancellationToken ct = default);

        // Retrieves paginated applications filtered by role and status
        Task<PagedResult<ApplicationSummaryDto>> GetApplicationsAsync(
            ApplicationQueryParameters query, 
            CancellationToken ct = default);

        // Retrieves full application dossier by ID
        Task<ApplicationDetailDto> GetApplicationByIdAsync(
            Guid applicationId, 
            CancellationToken ct = default);
    }
}
```

---

## 2. Compliance & Screening (`IComplianceOrchestratorService`)

```csharp
namespace ManagedAgentBroker.Application.Interfaces
{
    public interface IComplianceOrchestratorService
    {
        // Executes automated AMLO (ปปง.) screening for applicant & guarantor
        Task<AmloScreeningResultDto> RunAmloScreeningAsync(
            Guid applicationId, 
            CancellationToken ct = default);

        // Executes automated OIC (คปภ.) license verification and color rating
        Task<OicScreeningResultDto> RunOicScreeningAsync(
            Guid applicationId, 
            CancellationToken ct = default);

        // Evaluates combined risk profile and determines routing requirements
        Task<RiskEvaluationResultDto> EvaluateRiskProfileAsync(
            Guid applicationId, 
            CancellationToken ct = default);
    }
}
```

---

## 3. EAS Executive Approval (`IEasApprovalService`)

```csharp
namespace ManagedAgentBroker.Application.Interfaces
{
    public interface IEasApprovalService
    {
        // Prepares application package and dispatches approval request to EAS
        Task<EasSubmissionResultDto> SubmitToEasAsync(
            Guid applicationId, 
            SubmitToEasCommand command, 
            CancellationToken ct = default);

        // Inbound webhook handler for EAS electronic approval/rejection callback
        Task<EasCallbackResultDto> HandleEasWebhookCallbackAsync(
            EasCallbackPayload payload, 
            string signatureHeader, 
            CancellationToken ct = default);

        // Queries the current approval workflow state from EAS
        Task<EasWorkflowStatusDto> GetEasStatusAsync(
            string easTrackingId, 
            CancellationToken ct = default);
    }
}
```

---

## 4. 100% Automated Multi-System Provisioning (`IAutomatedCoreProvisioningService`)

```csharp
namespace ManagedAgentBroker.Application.Interfaces
{
    public interface IAutomatedCoreProvisioningService
    {
        // Triggers 100% automated background provisioning across all core systems
        Task<ProvisioningResultDto> ExecuteAutomatedProvisioningAsync(
            Guid applicationId, 
            ProvisioningTriggerCommand command, 
            CancellationToken ct = default);

        // Executes background retry for failed provisioning steps with exponential backoff
        Task<RetryResultDto> ProcessProvisioningRetryQueueAsync(
            CancellationToken ct = default);

        // Retrieves audit log of all core system sync transactions
        Task<IReadOnlyList<CoreSyncTransactionDto>> GetSyncTransactionsAsync(
            Guid applicationId, 
            CancellationToken ct = default);
    }
}
```

---

## 5. SLA Tracking & Automated Selling Suspension (`ISlaSuspensionDaemonService`)

```csharp
namespace ManagedAgentBroker.Application.Interfaces
{
    public interface ISlaSuspensionDaemonService
    {
        // Daily scheduled execution: checks 30-day and 90-day SLA deadlines
        Task<SlaEvaluationSummaryDto> RunDailySlaEvaluationAsync(
            CancellationToken ct = default);

        // Acknowledges physical hard copy receipt and promotes to ACTIVE_PERMANENT
        Task<PhysicalReceiptResultDto> AcknowledgeHardCopyReceiptAsync(
            Guid applicationId, 
            AcknowledgeReceiptCommand command, 
            CancellationToken ct = default);

        // Issues physical defect notice and initiates 30-day countdown timer
        Task<DefectNoticeResultDto> IssueDefectNoticeAsync(
            Guid applicationId, 
            IssueDefectCommand command, 
            CancellationToken ct = default);

        // Automatically executes tiered policy submission suspension in Deves Master and AS400
        Task<SuspensionExecutionDto> AutoSuspendAgentAsync(
            string agentCode, 
            string reason, 
            CancellationToken ct = default);

        Task<SuspensionExecutionDto> AutoSuspendSourceAsync(
            string agentCode, 
            string sourceCode, 
            string reason, 
            CancellationToken ct = default);

        // Automatically executes permanent termination in all core systems
        Task<TerminationExecutionDto> AutoTerminateAgentAsync(
            Guid applicationId, 
            string reason, 
            CancellationToken ct = default);
    }
}
```

---

## 6. External System API Clients (`Infrastructure.Clients`)

```csharp
namespace ManagedAgentBroker.Infrastructure.Clients
{
    public interface IDevesMasterApiClient
    {
        // 100% Automated Provisioning: creates Agent Code, Source Code(s), and registers UE
        Task<DevesMasterProvisionResponse> ProvisionAgentAndSourceAsync(
            DevesMasterProvisionRequest request, 
            CancellationToken ct = default);

        // Updates selling status (Active, Suspended, Terminated) at Agent or Source level
        Task<DevesMasterStatusResponse> UpdateSellingStatusAsync(
            string agentCode, 
            string? sourceCode, 
            string statusCode, 
            CancellationToken ct = default);
    }

    public interface IAs400ApiClient
    {
        Task<As400ProvisionResponse> SyncAgentMasterAsync(As400SyncAgentRequest request, CancellationToken ct = default);
        Task<As400StatusResponse> UpdateAgentStatusAsync(string agentCode, string statusCode, CancellationToken ct = default);
    }

    public interface ISapApiClient
    {
        Task<SapPartnerResponse> CreateBusinessPartnerAsync(SapCreatePartnerRequest request, CancellationToken ct = default);
    }

    public interface IAparApiClient
    {
        Task<AparAccountResponse> ConfigureLedgerAccountAsync(AparLedgerRequest request, CancellationToken ct = default);
    }

    public interface IPcsdisApiClient
    {
        Task<PcsdisNodeResponse> SetupNodeAndUeAsync(PcsdisSetupRequest request, CancellationToken ct = default);
        Task<PcsdisStatusResponse> SetSubmissionPermissionAsync(string agentCode, bool allowSubmission, CancellationToken ct = default);
    }

    public interface IAmloApiClient
    {
        Task<AmloCheckResponse> CheckDesignatedPersonsAsync(string nationalId, string fullNameTh, CancellationToken ct = default);
    }

    public interface IOicApiClient
    {
        Task<OicLicenseResponse> VerifyLicenseAndBlacklistAsync(string licenseNumber, string nationalId, CancellationToken ct = default);
    }

    public interface IEasApiClient
    {
        Task<EasCreateRequestResponse> CreateApprovalRequestAsync(EasApprovalPayload payload, CancellationToken ct = default);
    }
}
```
