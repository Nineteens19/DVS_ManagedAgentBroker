using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using FluentAssertions;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Infrastructure.Services;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class BranchScopeEvaluatorTests
    {
        private readonly BranchScopeEvaluator _evaluator = new();

        [Fact]
        public void ApplyBranchFilter_ForBranchUser_ShouldReturnOnlyApplicationsFromUserBranch()
        {
            // Arrange
            var branchClaims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new(ClaimTypes.Role, "ROLE_BRANCH_BU"),
                new("branch_code", "5Q")
            };
            var branchPrincipal = new ClaimsPrincipal(new ClaimsIdentity(branchClaims, "TestAuth"));

            var apps = new List<AgentApplication>
            {
                AgentApplication.CreateDraft("APP-001", AgentType.Individual, "5Q", "สาขาอุดรธานี", 50000m, "USER1"),
                AgentApplication.CreateDraft("APP-002", AgentType.Individual, "10", "สาขาหาดใหญ่", 50000m, "USER2"),
                AgentApplication.CreateDraft("APP-003", AgentType.Individual, "5Q", "สาขาอุดรธานี", 60000m, "USER3")
            }.AsQueryable();

            // Act
            var filtered = _evaluator.ApplyBranchFilter(apps, branchPrincipal).ToList();

            // Assert
            filtered.Should().HaveCount(2);
            filtered.Should().OnlyContain(a => a.BranchCode == "5Q");
        }

        [Theory]
        [InlineData("ROLE_HO_BU")]
        [InlineData("ROLE_PREMIUM_DEPT")]
        [InlineData("ROLE_LEGAL_DEPT")]
        [InlineData("ROLE_APPROVER_MD")]
        [InlineData("ROLE_IT_ADMIN")]
        public void ApplyBranchFilter_ForGlobalRoles_ShouldReturnAllApplicationsNationwide(string role)
        {
            // Arrange
            var globalClaims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new(ClaimTypes.Role, role),
                new("branch_code", "HQ")
            };
            var globalPrincipal = new ClaimsPrincipal(new ClaimsIdentity(globalClaims, "TestAuth"));

            var apps = new List<AgentApplication>
            {
                AgentApplication.CreateDraft("APP-001", AgentType.Individual, "5Q", "สาขาอุดรธานี", 50000m, "USER1"),
                AgentApplication.CreateDraft("APP-002", AgentType.Individual, "10", "สาขาหาดใหญ่", 50000m, "USER2"),
                AgentApplication.CreateDraft("APP-003", AgentType.Individual, "3A", "สาขาเชียงใหม่", 70000m, "USER3")
            }.AsQueryable();

            // Act
            var filtered = _evaluator.ApplyBranchFilter(apps, globalPrincipal).ToList();

            // Assert
            filtered.Should().HaveCount(3);
        }
    }
}
