using System.Threading;
using System.Threading.Tasks;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IApplicationNumberGenerator
    {
        Task<string> GenerateNextApplicationNumberAsync(CancellationToken ct = default);
    }
}
