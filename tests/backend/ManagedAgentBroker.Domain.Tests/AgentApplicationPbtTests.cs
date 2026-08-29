using System;
using FluentAssertions;
using FsCheck;
using FsCheck.Xunit;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Domain.Enums;
using ManagedAgentBroker.Domain.Exceptions;
using Xunit;

namespace ManagedAgentBroker.Domain.Tests
{
    public class AgentApplicationPbtTests
    {
        [Property(DisplayName = "PBT-01: RequestedCreditLimit >= 10000 should always produce valid draft, < 10000 throws validation exception")]
        public void Property_CreditLimitThreshold_Invariant(decimal requestedAmount)
        {
            if (requestedAmount >= 10000 && requestedAmount <= 100000000)
            {
                var app = AgentApplication.CreateDraft("APP-TEST", AgentType.Individual, "HQ", "HeadOffice", requestedAmount, "TEST_USER");
                app.RequestedCreditLimit.Should().Be(requestedAmount);
                app.Status.Should().Be(ApplicationStatus.Draft);
            }
            else if (requestedAmount < 10000)
            {
                Action act = () => AgentApplication.CreateDraft("APP-TEST", AgentType.Individual, "HQ", "HeadOffice", requestedAmount, "TEST_USER");
                act.Should().Throw<DomainRuleValidationException>();
            }
        }

        [Property(DisplayName = "PBT-01: Motor credit terms must strictly be 15, 30, or 31; all other integers throw DomainRuleValidationException")]
        public void Property_MotorCreditTerm_AllowedValues_Invariant(int motorDays)
        {
            var app = AgentApplication.CreateDraft("APP-TEST", AgentType.Individual, "HQ", "HeadOffice", 50000m, "TEST_USER");

            if (motorDays == 15 || motorDays == 30 || motorDays == 31)
            {
                app.SetCreditTerms(motorDays, 45);
                app.CreditTermMotorDays.Should().Be(motorDays);
            }
            else
            {
                Action act = () => app.SetCreditTerms(motorDays, 45);
                act.Should().Throw<DomainRuleValidationException>();
            }
        }
    }
}
