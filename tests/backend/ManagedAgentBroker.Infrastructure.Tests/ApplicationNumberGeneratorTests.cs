using System;
using System.Threading.Tasks;
using FluentAssertions;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Infrastructure.Persistence;
using ManagedAgentBroker.Infrastructure.Security.Cryptography;
using ManagedAgentBroker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class ApplicationNumberGeneratorTests
    {
        private ApplicationDbContext CreateInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var key = System.Text.Encoding.UTF8.GetBytes("TestMasterKey_32BytesLongSecret1");
            var dataProtectionProvider = new Aes256GcmDataProtectionProvider(key);
            return new ApplicationDbContext(options, dataProtectionProvider);
        }

        [Fact]
        public async Task GenerateNextApplicationNumberAsync_WhenEmpty_ShouldReturnSequence0001()
        {
            using var context = CreateInMemoryContext();
            var generator = new ApplicationNumberGenerator(context);

            var result = await generator.GenerateNextApplicationNumberAsync();

            var today = DateTime.UtcNow.ToString("yyyyMMdd");
            result.Should().Be($"APP-{today}-0001");
        }

        [Fact]
        public async Task GenerateNextApplicationNumberAsync_WhenExistingRecordsPresent_ShouldIncrement()
        {
            using var context = CreateInMemoryContext();
            var today = DateTime.UtcNow.ToString("yyyyMMdd");

            var app1 = AgentApplication.CreateDraft($"APP-{today}-0001", AgentType.Individual, "5Q", "สาขาอุดรธานี", 50000m, "USER1");
            var app2 = AgentApplication.CreateDraft($"APP-{today}-0002", AgentType.Individual, "5Q", "สาขาอุดรธานี", 50000m, "USER2");

            context.AgentApplications.AddRange(app1, app2);
            await context.SaveChangesAsync();

            var generator = new ApplicationNumberGenerator(context);
            var result = await generator.GenerateNextApplicationNumberAsync();

            result.Should().Be($"APP-{today}-0003");
        }
    }
}
