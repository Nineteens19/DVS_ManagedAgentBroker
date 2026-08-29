using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ManagedAgentBroker.Domain.Common;
using ManagedAgentBroker.Domain.Entities;
using ManagedAgentBroker.Infrastructure.Persistence.Configurations;
using ManagedAgentBroker.Infrastructure.Persistence.Converters;
using ManagedAgentBroker.Infrastructure.Security.Cryptography;
using Microsoft.EntityFrameworkCore;

namespace ManagedAgentBroker.Infrastructure.Persistence
{
    public interface IApplicationDbContext
    {
        DbSet<AgentApplication> AgentApplications { get; }
        DbSet<AgentProfile> AgentProfiles { get; }
        DbSet<Guarantor> Guarantors { get; }
        DbSet<Collateral> Collaterals { get; }
        DbSet<ComplianceRecord> ComplianceRecords { get; }
        DbSet<PhysicalContractRecord> PhysicalContractRecords { get; }
        DbSet<CoreSyncTransaction> CoreSyncTransactions { get; }
        DbSet<ApplicationAttachment> ApplicationAttachments { get; }
        DbSet<RejectChecklistItem> RejectChecklistItems { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }

    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        private readonly IDataProtectionProvider _dataProtectionProvider;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            IDataProtectionProvider dataProtectionProvider)
            : base(options)
        {
            _dataProtectionProvider = dataProtectionProvider;
        }

        public DbSet<AgentApplication> AgentApplications => Set<AgentApplication>();
        public DbSet<AgentProfile> AgentProfiles => Set<AgentProfile>();
        public DbSet<Guarantor> Guarantors => Set<Guarantor>();
        public DbSet<Collateral> Collaterals => Set<Collateral>();
        public DbSet<ComplianceRecord> ComplianceRecords => Set<ComplianceRecord>();
        public DbSet<PhysicalContractRecord> PhysicalContractRecords => Set<PhysicalContractRecord>();
        public DbSet<CoreSyncTransaction> CoreSyncTransactions => Set<CoreSyncTransaction>();
        public DbSet<ApplicationAttachment> ApplicationAttachments => Set<ApplicationAttachment>();
        public DbSet<RejectChecklistItem> RejectChecklistItems => Set<RejectChecklistItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var encryptionConverter = new Aes256GcmValueConverter(_dataProtectionProvider);

            modelBuilder.ApplyConfiguration(new AgentApplicationConfiguration());
            modelBuilder.ApplyConfiguration(new AgentProfileConfiguration(encryptionConverter));
            modelBuilder.ApplyConfiguration(new GuarantorConfiguration(encryptionConverter));

            // Apply Global Query Filter for Soft Delete across all entities inheriting BaseEntity<Guid>
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity<Guid>).IsAssignableFrom(entityType.ClrType))
                {
                    var parameter = Expression.Parameter(entityType.ClrType, "e");
                    var filter = Expression.Lambda(
                        Expression.Equal(
                            Expression.Property(parameter, nameof(BaseEntity<Guid>.IsDeleted)),
                            Expression.Constant(false)),
                        parameter);

                    entityType.SetQueryFilter(filter);
                }
            }
        }
    }
}
