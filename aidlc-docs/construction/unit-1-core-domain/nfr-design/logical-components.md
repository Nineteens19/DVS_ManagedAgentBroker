# Logical Components & Infrastructure Elements — Unit 1: Core Domain & DB Schema

This document details the logical components, interfaces, and DI registrations for Unit 1.

---

## 1. Component Architecture & Relationships

```
+---------------------------------------------------------------------------------------+
|                                    ApplicationDbContext                              |
|  - UnitOfWork pattern, ChangeTracker, Custom Configurations, Global Query Filters     |
+---------------------------------------------------------------------------------------+
            |                                           |
            v                                           v
+-----------------------------+             +-------------------------------------------+
|  AuditSaveChangesInterceptor|             |         Aes256GcmValueConverter           |
|  - Injects Current User     |             |  - Encrypts/Decrypts PII via Provider     |
|  - Auto sets Audit Stamps   |             +-------------------------------------------+
+-----------------------------+                                 |
                                                                v
                                            +-------------------------------------------+
                                            |       Aes256GcmDataProtectionProvider     |
                                            |  - Wraps System.Security.Cryptography     |
                                            +-------------------------------------------+
                                                                |
                                                                v
                                            +-------------------------------------------+
                                            |            IKeyVaultProvider              |
                                            |  - Retrieves Master Key (Env/Cloud Vault) |
                                            +-------------------------------------------+
```

---

## 2. Logical Component Specifications

### 2.1 `IKeyVaultProvider` & `ConfigurationKeyVaultProvider`
- **Purpose**: Provides high-security access to cryptographic master keys with zero vendor lock-in.
- **Contract**:
```csharp
namespace ManagedAgentBroker.Infrastructure.Security.KeyVault
{
    public interface IKeyVaultProvider
    {
        Task<byte[]> GetMasterKeyAsync(string keyName, CancellationToken ct = default);
    }

    public class ConfigurationKeyVaultProvider : IKeyVaultProvider
    {
        private readonly IConfiguration _configuration;
        public ConfigurationKeyVaultProvider(IConfiguration configuration) => _configuration = configuration;

        public Task<byte[]> GetMasterKeyAsync(string keyName, CancellationToken ct = default)
        {
            var keyString = _configuration[$"DataEncryption:{keyName}"] 
                ?? throw new InvalidOperationException($"Encryption key '{keyName}' not configured.");
            return Task.FromResult(Convert.FromBase64String(keyString));
        }
    }
}
```

### 2.2 `IDataProtectionProvider` & `Aes256GcmDataProtectionProvider`
- **Purpose**: Encapsulates AES-256-GCM authentication encryption with nonce generation and tag verification.
- **Contract**:
```csharp
namespace ManagedAgentBroker.Infrastructure.Security.Cryptography
{
    public interface IDataProtectionProvider
    {
        string Encrypt(string plainText);
        string Decrypt(string cipherText);
    }
}
```

### 2.3 `PiiMaskingLogEnricher` (Serilog)
- **Purpose**: Sanitizes log outputs by scanning and masking Thai National IDs (`X-XXXX-XXXXX-XX-X`) and Bank Account Numbers.
- **Contract**:
```csharp
namespace ManagedAgentBroker.Infrastructure.Logging
{
    public class PiiMaskingLogEnricher : ILogEventEnricher
    {
        private static readonly Regex ThaiIdRegex = new(@"\b(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})\b", RegexOptions.Compiled);

        public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
        {
            // Sanitizes log message template and properties to mask PII
        }
    }
}
```

---

## 3. Dependency Injection Configuration

```csharp
namespace ManagedAgentBroker.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureData(
            this IServiceCollection services, 
            IConfiguration configuration)
        {
            services.AddSingleton<IKeyVaultProvider, ConfigurationKeyVaultProvider>();
            services.AddSingleton<IDataProtectionProvider, Aes256GcmDataProtectionProvider>();
            services.AddScoped<AuditSaveChangesInterceptor>();

            services.AddDbContext<ApplicationDbContext>((sp, options) =>
            {
                var interceptor = sp.GetRequiredService<AuditSaveChangesInterceptor>();
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    sqlServerOptions =>
                    {
                        sqlServerOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null);
                        sqlServerOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    })
                    .AddInterceptors(interceptor);
            });

            return services;
        }
    }
}
```
