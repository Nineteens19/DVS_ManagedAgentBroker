using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public class ApplicationNumberGenerator : IApplicationNumberGenerator
    {
        private readonly IApplicationDbContext _context;

        public ApplicationNumberGenerator(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateNextApplicationNumberAsync(CancellationToken ct = default)
        {
            var today = DateTime.UtcNow.Date;
            var prefix = $"APP-{today:yyyyMMdd}-";

            // Count existing applications created with this prefix today
            var existingCount = await _context.AgentApplications
                .IgnoreQueryFilters()
                .Where(a => a.ApplicationNumber.StartsWith(prefix))
                .CountAsync(ct);

            int sequence = existingCount + 1;
            string candidate;

            while (true)
            {
                candidate = $"{prefix}{sequence:D4}";
                bool exists = await _context.AgentApplications
                    .IgnoreQueryFilters()
                    .AnyAsync(a => a.ApplicationNumber == candidate, ct);

                if (!exists)
                {
                    return candidate;
                }

                sequence++;
            }
        }
    }
}
