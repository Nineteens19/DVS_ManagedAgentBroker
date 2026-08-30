using System;
using ManagedAgentBroker.Domain.Enums;

namespace ManagedAgentBroker.Domain.Exceptions
{
    public class InvalidStateTransitionException : Exception
    {
        public ApplicationStatus CurrentStatus { get; }
        public ApplicationStatus TargetStatus { get; }

        public InvalidStateTransitionException(ApplicationStatus currentStatus, ApplicationStatus targetStatus, string? reason = null)
            : base($"Invalid state transition from '{currentStatus}' to '{targetStatus}'. {(reason != null ? $"Reason: {reason}" : string.Empty)}")
        {
            CurrentStatus = currentStatus;
            TargetStatus = targetStatus;
        }
    }

    public class DomainRuleValidationException : Exception
    {
        public string RuleCode { get; }

        public DomainRuleValidationException(string ruleCode, string message)
            : base($"[Domain Rule Violation: {ruleCode}] {message}")
        {
            RuleCode = ruleCode;
        }
    }

    public class EntityNotFoundException : Exception
    {
        public string EntityName { get; }
        public object Key { get; }

        public EntityNotFoundException(string entityName, object key)
            : base($"Entity '{entityName}' with key '{key}' was not found.")
        {
            EntityName = entityName;
            Key = key;
        }
    }
}
