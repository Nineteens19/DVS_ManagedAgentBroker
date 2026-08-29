# Non-Functional Design Patterns — Unit 1: Core Domain & DB Schema

This document specifies the technical design patterns for concurrency, encryption, auditing, and resiliency.

---

## 1. Concurrency Control Pattern (Optimistic Concurrency)

```csharp
namespace ManagedAgentBroker.Infrastructure.Persistence.Configurations
{
    public class AgentApplicationConfiguration : IEntityTypeConfiguration<AgentApplication>
    {
        public void Configure(EntityTypeBuilder<AgentApplication> builder)
        {
            builder.ToTable("AgentApplications");
            builder.HasKey(e => e.Id);

            // Optimistic Concurrency Token
            builder.Property<byte[]>("RowVersion")
                .IsRowVersion()
                .IsRequired();

            builder.Property(e => e.ApplicationNumber)
                .HasMaxLength(30)
                .IsRequired();

            builder.HasIndex(e => e.ApplicationNumber).IsUnique();
            builder.HasIndex(e => e.Status);
            builder.HasIndex(e => e.BranchCode);
            builder.HasIndex(e => e.Sla30DayDeadline);
        }
    }
}
```

---

## 2. AES-256-GCM Column Encryption Converter Pattern

```csharp
namespace ManagedAgentBroker.Infrastructure.Security.Cryptography
{
    public class Aes256GcmValueConverter : ValueConverter<string, string>
    {
        public Aes256GcmValueConverter(IDataProtectionProvider encryptionProvider)
            : base(
                plainText => encryptionProvider.Encrypt(plainText),
                cipherText => encryptionProvider.Decrypt(cipherText))
        { }
    }
}
```

### Encryption Format Specification:
- **Cipher**: AES-256-GCM (Galois/Counter Mode with built-in authentication tag).
- **Format**: `ENC_v1:{Base64(Nonce[12 bytes])}:{Base64(CipherBytes)}:{Base64(Tag[16 bytes])}`.

---

## 3. ISO 27001 Audit Interceptor Pattern

```csharp
namespace ManagedAgentBroker.Infrastructure.Persistence.Interceptors
{
    public class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        private readonly ICurrentUserService _currentUserService;

        public AuditSaveChangesInterceptor(ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData, 
            InterceptionResult<int> result, 
            CancellationToken cancellationToken = default)
        {
            var dbContext = eventData.Context;
            if (dbContext == null) return base.SavingChangesAsync(eventData, result, cancellationToken);

            var now = DateTime.UtcNow;
            var userId = _currentUserService.UserId ?? "SYSTEM";

            foreach (var entry in dbContext.ChangeTracker.Entries<BaseEntity<Guid>>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedBy = userId;
                    entry.Entity.IsDeleted = false;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedBy = userId;
                }
                else if (entry.State == EntityState.Deleted)
                {
                    // Convert hard delete to soft delete
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedAt = now;
                    entry.Entity.DeletedBy = userId;
                }
            }

            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }
    }
}
```

---

## 4. Global Query Filter Pattern (Soft Delete)

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Apply global query filter across all BaseEntity types
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
```
