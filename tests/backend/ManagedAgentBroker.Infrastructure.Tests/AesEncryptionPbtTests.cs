using System;
using System.Security.Cryptography;
using FluentAssertions;
using FsCheck;
using FsCheck.Xunit;
using ManagedAgentBroker.Infrastructure.Security.Cryptography;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class AesEncryptionPbtTests
    {
        private readonly Aes256GcmDataProtectionProvider _provider;

        public AesEncryptionPbtTests()
        {
            var key = new byte[32];
            RandomNumberGenerator.Fill(key);
            _provider = new Aes256GcmDataProtectionProvider(key);
        }

        [Property(DisplayName = "PBT-02: Round-trip AES-256-GCM encryption property: Decrypt(Encrypt(plainText)) == plainText")]
        public void Property_RoundTripEncryption_IsLossless(NonNull<string> input)
        {
            var original = input.Get;
            var encrypted = _provider.Encrypt(original);

            if (!string.IsNullOrEmpty(original))
            {
                encrypted.Should().StartWith("ENC_v1:");
            }

            var decrypted = _provider.Decrypt(encrypted);
            decrypted.Should().Be(original);
        }

        [Fact]
        public void ThaiNationalId_RoundTripEncryption_ShouldPreserveExactDigits()
        {
            // Arrange
            var thaiId = "1410100123456";

            // Act
            var encrypted = _provider.Encrypt(thaiId);
            var decrypted = _provider.Decrypt(encrypted);

            // Assert
            encrypted.Should().NotBe(thaiId);
            decrypted.Should().Be(thaiId);
        }

        [Fact]
        public void BankAccountNumber_RoundTripEncryption_ShouldPreserveExactDigits()
        {
            // Arrange
            var bankAccount = "123-4-56789-0";

            // Act
            var encrypted = _provider.Encrypt(bankAccount);
            var decrypted = _provider.Decrypt(encrypted);

            // Assert
            encrypted.Should().NotBe(bankAccount);
            decrypted.Should().Be(bankAccount);
        }
    }
}
