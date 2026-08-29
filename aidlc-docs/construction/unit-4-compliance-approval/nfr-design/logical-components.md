# Logical Components — Unit 4: Compliance Screening & Native Approval Engine

This document defines the class structures, service contracts, and dependency injection specifications for Unit 4.

---

## 1. Component Overview

```
ManagedAgentBroker.Infrastructure
├── Services/
│   ├── IComplianceScreeningService.cs
│   ├── ComplianceScreeningService.cs
│   ├── IApprovalWorkflowService.cs
│   ├── ApprovalWorkflowService.cs
│   ├── IEmailNotificationService.cs
│   ├── SmtpEmailNotificationService.cs
│   └── InMemoryEmailNotificationService.cs
└── Configuration/
    └── EmailSettings.cs
```

---

## 2. Configuration Options Model

```csharp
public class EmailSettings
{
    public const string SectionName = "EmailSettings";

    public string SmtpHost { get; set; } = "localhost";
    public int SmtpPort { get; set; } = 25;
    public string SenderEmail { get; set; } = "noreply@insurance-broker.com";
    public string SenderName { get; set; } = "Agent & Broker System";
    public string? Username { get; set; }
    public string? Password { get; set; }
    public bool EnableSsl { get; set; } = false;
    public bool UseInMemoryFallback { get; set; } = true;
}
```

---

## 3. Dependency Injection Registration

```csharp
// Email Service (InMemory vs SMTP)
services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));
services.AddSingleton<InMemoryEmailNotificationService>();
services.AddScoped<IEmailNotificationService>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<EmailSettings>>().Value;
    if (settings.UseInMemoryFallback)
        return sp.GetRequiredService<InMemoryEmailNotificationService>();
    return new SmtpEmailNotificationService(
        sp.GetRequiredService<IOptions<EmailSettings>>(),
        sp.GetRequiredService<ILogger<SmtpEmailNotificationService>>());
});

// Compliance & Approval Services
services.AddScoped<IComplianceScreeningService, ComplianceScreeningService>();
services.AddScoped<IApprovalWorkflowService, ApprovalWorkflowService>();
```
