namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface ICurrentUserService
    {
        string? UserId { get; }
        string? UserName { get; }
        string? BranchCode { get; }
        IReadOnlyList<string> Roles { get; }
    }

    public class SystemCurrentUserService : ICurrentUserService
    {
        public string? UserId => "SYSTEM";
        public string? UserName => "System Administrator";
        public string? BranchCode => "000";
        public IReadOnlyList<string> Roles => new[] { "ROLE_IT_ADMIN" };
    }
}
