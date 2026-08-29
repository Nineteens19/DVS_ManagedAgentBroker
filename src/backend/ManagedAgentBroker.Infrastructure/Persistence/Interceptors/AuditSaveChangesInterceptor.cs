using System;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.Common;
using ManagedAgentBroker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ManagedAgentBroker.Infrastructure.Persistence.Interceptors
{
    public class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        private readonly ICurrentUserService _currentUserService;

        public AuditSaveChangesInterceptor(ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }

        public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
        {
            ApplyAuditInformation(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData, 
            InterceptionResult<int> result, 
            CancellationToken cancellationToken = default)
        {
            ApplyAuditInformation(eventData.Context);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private void ApplyAuditInformation(DbContext? dbContext)
        {
            if (dbContext == null) return;

            var now = DateTime.UtcNow;
            var userId = _currentUserService.UserId ?? "SYSTEM";

            foreach (var entry in dbContext.ChangeTracker.Entries())
            {
                if (entry.Entity is BaseEntity<Guid> baseEntity)
                {
                    if (entry.State == EntityState.Added)
                    {
                        baseEntity.CreatedAt = now;
                        baseEntity.CreatedBy = userId;
                        baseEntity.IsDeleted = false;
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        baseEntity.UpdatedAt = now;
                        baseEntity.UpdatedBy = userId;
                    }
                    else if (entry.State == EntityState.Deleted)
                    {
                        // Convert physical delete to soft delete per ISO 27001
                        entry.State = EntityState.Modified;
                        baseEntity.IsDeleted = true;
                        baseEntity.DeletedAt = now;
                        baseEntity.DeletedBy = userId;
                    }
                }
            }
        }
    }
}
