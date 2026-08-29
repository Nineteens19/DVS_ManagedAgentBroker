using System.Linq;
using System.Security.Claims;
using ManagedAgentBroker.Domain.Entities;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IBranchScopeEvaluator
    {
        bool IsGlobalScope(ClaimsPrincipal user);
        string? GetUserBranchCode(ClaimsPrincipal user);
        IQueryable<AgentApplication> ApplyBranchFilter(IQueryable<AgentApplication> query, ClaimsPrincipal user);
    }

    public class BranchScopeEvaluator : IBranchScopeEvaluator
    {
        private static readonly string[] GlobalScopeRoles =
        {
            "ROLE_HO_BU",
            "ROLE_PREMIUM_DEPT",
            "ROLE_LEGAL_DEPT",
            "ROLE_APPROVER_MD",
            "ROLE_IT_ADMIN"
        };

        public bool IsGlobalScope(ClaimsPrincipal user)
        {
            if (user == null) return false;

            return GlobalScopeRoles.Any(role => user.IsInRole(role));
        }

        public string? GetUserBranchCode(ClaimsPrincipal user)
        {
            return user.FindFirst("branch_code")?.Value;
        }

        public IQueryable<AgentApplication> ApplyBranchFilter(IQueryable<AgentApplication> query, ClaimsPrincipal user)
        {
            if (IsGlobalScope(user))
            {
                return query;
            }

            var branchCode = GetUserBranchCode(user);
            if (string.IsNullOrWhiteSpace(branchCode))
            {
                // If user is neither global nor has branch code, deny access to all records
                return query.Where(_ => false);
            }

            return query.Where(a => a.BranchCode == branchCode);
        }
    }
}
