using System;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.DTOs;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IApplicationIntakeService
    {
        Task<AgentApplicationDto> CreateDraftAsync(CreateDraftApplicationCommand cmd, string createdBy, CancellationToken ct = default);
        Task<AgentApplicationDto> UpdateDraftAsync(Guid applicationId, UpdateDraftApplicationCommand cmd, string updatedBy, CancellationToken ct = default);
        Task<AgentApplicationDto?> GetByIdAsync(Guid applicationId, CancellationToken ct = default);
        Task<AttachmentDto> UploadAttachmentAsync(Guid applicationId, UploadAttachmentCommand cmd, string uploadedBy, CancellationToken ct = default);
        Task<bool> DeleteAttachmentAsync(Guid applicationId, Guid attachmentId, string deletedBy, CancellationToken ct = default);
        Task<AgentApplicationDto> SubmitByBranchAsync(Guid applicationId, string userId, CancellationToken ct = default);
        Task<AgentApplicationDto> ReturnForCorrectionAsync(Guid applicationId, ReturnForCorrectionCommand cmd, string reviewerId, CancellationToken ct = default);
        Task<AgentApplicationDto> ResubmitAsync(Guid applicationId, ResubmitApplicationCommand cmd, string userId, CancellationToken ct = default);
    }
}
