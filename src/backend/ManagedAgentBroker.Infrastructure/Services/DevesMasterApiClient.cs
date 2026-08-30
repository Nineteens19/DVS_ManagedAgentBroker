using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ManagedAgentBroker.Domain.DTOs;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Infrastructure.Configuration;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public class DevesMasterApiClient : IDevesMasterApiClient
    {
        private readonly ProvisioningSettings _settings;
        private readonly ILogger<DevesMasterApiClient> _logger;

        public DevesMasterApiClient(
            IOptions<ProvisioningSettings> settings,
            ILogger<DevesMasterApiClient> logger)
        {
            _settings = settings?.Value ?? new ProvisioningSettings();
            _logger = logger;
        }

        public async Task<GeneratedAgentCodesDto> GenerateCodesAsync(
            GenerateAgentCodesCommand cmd,
            CancellationToken ct = default)
        {
            if (cmd == null)
                throw new ArgumentNullException(nameof(cmd));

            _logger.LogInformation(
                "Requesting AgentCode and SourceCode generation from Deves Master API for AppId: {AppId}, AgentType: {AgentType}, Branch: {BranchCode}",
                cmd.ApplicationId, cmd.AgentType, cmd.BranchCode);

            if (_settings.UseSandboxSimulators)
            {
                await Task.Delay(50, ct); // Simulated network latency

                var year = DateTime.UtcNow.Year;
                var prefix = cmd.AgentType == AgentType.Corporate ? "BR" : "AG";
                
                // Derive deterministic sequence number from NationalId/TaxId hash for reproducible tests
                var seqNumber = DeriveNumericSequence(cmd.NationalIdOrTaxId, 10000, 99999);
                var branchSeq = DeriveNumericSequence(cmd.NationalIdOrTaxId, 1000, 9999);

                var agentCode = $"{prefix}{year}{seqNumber}";
                var branchCode = string.IsNullOrWhiteSpace(cmd.BranchCode) ? "HQ" : cmd.BranchCode.Trim();
                var sourceCode = $"SRC-B{branchCode}-{branchSeq}";
                var unitExecutiveCode = $"UE-B{branchCode}-01";

                var result = new GeneratedAgentCodesDto
                {
                    AgentCode = agentCode,
                    SourceCode = sourceCode,
                    UnitExecutiveCode = unitExecutiveCode,
                    MasterReferenceTransactionId = $"DM-TXN-{Guid.NewGuid():N}".ToUpperInvariant(),
                    GeneratedAt = DateTime.UtcNow
                };

                _logger.LogInformation(
                    "Deves Master Sandbox generated: AgentCode={AgentCode}, SourceCode={SourceCode}, TxnId={TxnId}",
                    result.AgentCode, result.SourceCode, result.MasterReferenceTransactionId);

                return result;
            }

            // Real REST client implementation placeholder for production
            throw new NotImplementedException("Production Deves Master REST endpoint integration configured for live environment.");
        }

        private static int DeriveNumericSequence(string input, int min, int max)
        {
            if (string.IsNullOrEmpty(input))
                return min;

            using var sha = SHA256.Create();
            var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
            var value = BitConverter.ToUInt32(hashBytes, 0);
            var range = (uint)(max - min + 1);
            return (int)(min + (value % range));
        }
    }
}
