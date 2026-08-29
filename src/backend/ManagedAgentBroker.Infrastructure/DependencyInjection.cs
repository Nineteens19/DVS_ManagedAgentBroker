using ManagedAgentBroker.Infrastructure.Persistence;
using ManagedAgentBroker.Infrastructure.Persistence.Interceptors;
using ManagedAgentBroker.Infrastructure.Persistence.Seeding;
using ManagedAgentBroker.Infrastructure.Security.Cryptography;
using ManagedAgentBroker.Infrastructure.Security.KeyVault;
using ManagedAgentBroker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ManagedAgentBroker.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Security & Cryptography
            services.AddSingleton<IKeyVaultProvider, ConfigurationKeyVaultProvider>();
            services.AddSingleton<IDataProtectionProvider, Aes256GcmDataProtectionProvider>();
            services.AddSingleton<ICurrentUserService, SystemCurrentUserService>();
            services.AddScoped<AuditSaveChangesInterceptor>();
            services.AddScoped<DatabaseSeeder>();

            // Persistence
            services.AddDbContext<ApplicationDbContext>((sp, options) =>
            {
                var auditInterceptor = sp.GetRequiredService<AuditSaveChangesInterceptor>();
                var connectionString = configuration.GetConnectionString("DefaultConnection") 
                    ?? "Server=localhost,1433;Database=ManagedAgentBrokerDb;User Id=sa;Password=DevPassword123!;TrustServerCertificate=True;";

                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: System.TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);
                    sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                })
                .AddInterceptors(auditInterceptor);
            });

            services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

            return services;
        }
    }
}
