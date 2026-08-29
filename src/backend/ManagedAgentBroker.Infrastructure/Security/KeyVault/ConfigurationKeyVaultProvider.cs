using System;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace ManagedAgentBroker.Infrastructure.Security.KeyVault
{
    public interface IKeyVaultProvider
    {
        Task<byte[]> GetMasterKeyAsync(string keyName, CancellationToken ct = default);
        byte[] GetMasterKey(string keyName);
    }

    public class ConfigurationKeyVaultProvider : IKeyVaultProvider
    {
        private readonly IConfiguration _configuration;
        private static readonly byte[] FallbackKey = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes("ManagedAgentBrokerDefaultMasterEncryptionKey2026!#$"));

        public ConfigurationKeyVaultProvider(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public Task<byte[]> GetMasterKeyAsync(string keyName, CancellationToken ct = default)
        {
            return Task.FromResult(GetMasterKey(keyName));
        }

        public byte[] GetMasterKey(string keyName)
        {
            var keyString = _configuration[$"DataEncryption:{keyName}"];
            if (string.IsNullOrWhiteSpace(keyString))
            {
                return FallbackKey;
            }

            try
            {
                var bytes = Convert.FromBase64String(keyString);
                return bytes.Length == 32 ? bytes : SHA256.HashData(bytes);
            }
            catch
            {
                return SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(keyString));
            }
        }
    }
}
