using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FluentAssertions;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class JwtTokenServiceTests
    {
        private readonly JwtTokenService _tokenService;

        public JwtTokenServiceTests()
        {
            var configData = new Dictionary<string, string?>
            {
                { "Jwt:Secret", "SuperSecretJwtSigningKeyForManagedAgentBroker2026!#$" },
                { "Jwt:Issuer", "ManagedAgentBroker.Api" },
                { "Jwt:Audience", "ManagedAgentBroker.Web" },
                { "Jwt:AccessTokenExpirationMinutes", "15" },
                { "Jwt:RefreshTokenExpirationDays", "7" }
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(configData)
                .Build();

            _tokenService = new JwtTokenService(configuration);
        }

        [Fact]
        public void GenerateAccessToken_ShouldIncludeUserAndRoleClaims()
        {
            // Arrange
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = "branch.user",
                Email = "branch.user@company.co.th",
                FullName = "สมชาย รักสาขา",
                BranchCode = "5Q",
                Department = "Branch Marketing"
            };

            var roles = new[] { "ROLE_BRANCH_BU" };

            // Act
            var token = _tokenService.GenerateAccessToken(user, roles);

            // Assert
            token.Should().NotBeNullOrWhiteSpace();

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            jwtToken.Issuer.Should().Be("ManagedAgentBroker.Api");
            jwtToken.Audiences.Should().Contain("ManagedAgentBroker.Web");
            jwtToken.Claims.Should().Contain(c => (c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid") && c.Value == user.Id.ToString());
            jwtToken.Claims.Should().Contain(c => (c.Type == ClaimTypes.Role || c.Type == "role") && c.Value == "ROLE_BRANCH_BU");
            jwtToken.Claims.Should().Contain(c => c.Type == "branch_code" && c.Value == "5Q");
        }

        [Fact]
        public void GenerateRefreshToken_ShouldProduceHighEntropyTokenAndHexHash()
        {
            // Act
            var (rawToken, tokenHash, expiresAt) = _tokenService.GenerateRefreshToken();

            // Assert
            rawToken.Should().NotBeNullOrWhiteSpace();
            tokenHash.Should().HaveLength(64); // SHA-256 hex string length
            expiresAt.Should().BeAfter(DateTime.UtcNow.AddDays(6));
        }
    }
}
