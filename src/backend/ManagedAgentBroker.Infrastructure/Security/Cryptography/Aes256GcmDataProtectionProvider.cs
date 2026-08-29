using System;
using System.Security.Cryptography;
using System.Text;
using ManagedAgentBroker.Infrastructure.Security.KeyVault;

namespace ManagedAgentBroker.Infrastructure.Security.Cryptography
{
    public interface IDataProtectionProvider
    {
        string Encrypt(string? plainText);
        string? Decrypt(string? cipherText);
    }

    public class Aes256GcmDataProtectionProvider : IDataProtectionProvider
    {
        private readonly byte[] _key;
        private const int NonceSize = 12; // 96 bits for GCM
        private const int TagSize = 16;   // 128 bits for GCM

        public Aes256GcmDataProtectionProvider(IKeyVaultProvider keyVaultProvider)
        {
            _key = keyVaultProvider.GetMasterKey("Key");
        }

        public Aes256GcmDataProtectionProvider(byte[] key)
        {
            if (key.Length != 32)
                throw new ArgumentException("AES-256 requires a 32-byte key.", nameof(key));
            _key = key;
        }

        public string Encrypt(string? plainText)
        {
            if (string.IsNullOrEmpty(plainText))
                return plainText ?? string.Empty;

            var plainBytes = Encoding.UTF8.GetBytes(plainText);
            var nonce = new byte[NonceSize];
            RandomNumberGenerator.Fill(nonce);

            var cipherBytes = new byte[plainBytes.Length];
            var tag = new byte[TagSize];

            using var aesGcm = new AesGcm(_key, TagSize);
            aesGcm.Encrypt(nonce, plainBytes, cipherBytes, tag);

            return $"ENC_v1:{Convert.ToBase64String(nonce)}:{Convert.ToBase64String(cipherBytes)}:{Convert.ToBase64String(tag)}";
        }

        public string? Decrypt(string? cipherText)
        {
            if (string.IsNullOrEmpty(cipherText))
                return cipherText;

            if (!cipherText.StartsWith("ENC_v1:"))
                return cipherText; // Return as-is if unencrypted legacy data

            var parts = cipherText.Split(':');
            if (parts.Length != 4)
                throw new FormatException("Invalid encrypted ciphertext format.");

            var nonce = Convert.FromBase64String(parts[1]);
            var cipherBytes = Convert.FromBase64String(parts[2]);
            var tag = Convert.FromBase64String(parts[3]);

            var plainBytes = new byte[cipherBytes.Length];

            using var aesGcm = new AesGcm(_key, TagSize);
            aesGcm.Decrypt(nonce, cipherBytes, tag, plainBytes);

            return Encoding.UTF8.GetString(plainBytes);
        }
    }
}
