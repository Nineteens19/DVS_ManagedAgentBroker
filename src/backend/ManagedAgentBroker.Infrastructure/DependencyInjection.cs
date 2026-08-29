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
            // Unit 2 Identity & Directory Services
            services.AddSingleton<IPasswordHashService, PasswordHashService>();
            services.AddSingleton<ITokenService, JwtTokenService>();
            services.AddScoped<IBranchScopeEvaluator, BranchScopeEvaluator>();
            services.AddScoped<IIdentityService, IdentityService>();
            services.AddSingleton<ICurrentUserService, SystemCurrentUserService>();
            services.AddScoped<AuditSaveChangesInterceptor>();
            services.AddScoped<DatabaseSeeder>();

            // Unit 3 Application Intake & Document Management Services
            services.AddSingleton<IFileSignatureValidator, FileSignatureValidator>();
            services.AddScoped<IFileStorageService, LocalDiskFileStorageService>();
            services.AddScoped<IApplicationNumberGenerator, ApplicationNumberGenerator>();
            services.AddScoped<IApplicationIntakeService, ApplicationIntakeService>();

            // Unit 4 Compliance Screening, Approval Workflow & Email Notification Services
            services.Configure<Configuration.EmailSettings>(options =>
                configuration.GetSection(Configuration.EmailSettings.SectionName).Bind(options));
            services.AddSingleton<InMemoryEmailNotificationService>();
            services.AddScoped<IEmailNotificationService>(sp =>
            {
                var settings = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<Configuration.EmailSettings>>().Value;
                if (settings.UseInMemoryFallback)
                {
                    return sp.GetRequiredService<InMemoryEmailNotificationService>();
                }
                return new SmtpEmailNotificationService(
                    sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<Configuration.EmailSettings>>(),
                    sp.GetRequiredService<Microsoft.Extensions.Logging.ILogger<SmtpEmailNotificationService>>());
            });
            services.AddScoped<IComplianceScreeningService, ComplianceScreeningService>();
            services.AddScoped<IApprovalWorkflowService, ApprovalWorkflowService>();

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
