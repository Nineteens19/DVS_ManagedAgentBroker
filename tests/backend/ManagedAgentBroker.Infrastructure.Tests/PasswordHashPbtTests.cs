using System;
using FluentAssertions;
using FsCheck;
using FsCheck.Xunit;
using ManagedAgentBroker.Infrastructure.Services;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class PasswordHashPbtTests
    {
        private readonly PasswordHashService _hasher = new();

        [Property(DisplayName = "PBT-03: PBKDF2 Password Verification Invariant: VerifyPassword(HashPassword(pwd), pwd) == true")]
        public void Property_PasswordHash_Verification_IsTrue_ForSamePassword(NonNull<string> input)
        {
            var rawPassword = input.Get;
            if (string.IsNullOrEmpty(rawPassword)) return;

            var hashed = _hasher.HashPassword(rawPassword);
            var isMatch = _hasher.VerifyPassword(hashed, rawPassword);

            isMatch.Should().BeTrue();
        }

        [Property(DisplayName = "PBT-03: PBKDF2 Password Verification Invariant: VerifyPassword(HashPassword(pwd), wrongPwd) == false")]
        public void Property_PasswordHash_Verification_IsFalse_ForDifferentPassword(NonNull<string> input, NonNull<string> differentInput)
        {
            var pwd1 = input.Get;
            var pwd2 = differentInput.Get;

            if (string.IsNullOrEmpty(pwd1) || string.IsNullOrEmpty(pwd2) || pwd1 == pwd2) return;

            var hashed = _hasher.HashPassword(pwd1);
            var isMatch = _hasher.VerifyPassword(hashed, pwd2);

            isMatch.Should().BeFalse();
        }

        [Fact]
        public void StandardPersonaPassword_ShouldHashAndVerifySuccessfully()
        {
            // Arrange
            var password = "P@ssword123!";

            // Act
            var hash = _hasher.HashPassword(password);
            var result = _hasher.VerifyPassword(hash, password);

            // Assert
            hash.Should().Contain(":");
            result.Should().BeTrue();
        }
    }
}
