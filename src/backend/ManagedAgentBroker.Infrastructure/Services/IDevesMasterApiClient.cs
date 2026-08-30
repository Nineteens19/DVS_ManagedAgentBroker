using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.DTOs;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IDevesMasterApiClient
    {
        Task<GeneratedAgentCodesDto> GenerateCodesAsync(
            GenerateAgentCodesCommand cmd,
            CancellationToken ct = default);
    }
}
