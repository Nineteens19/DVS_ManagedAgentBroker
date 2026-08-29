# Logical Components — Unit 3: Application Intake & Document Management

This document defines the logical interfaces, service contracts, and dependency injection mappings for Unit 3.

---

## 1. Logical Interface Contracts

### 1.1 `IApplicationNumberGenerator`
```csharp
public interface IApplicationNumberGenerator
{
    Task<string> GenerateNextApplicationNumberAsync(CancellationToken ct = default);
}
```

### 1.2 `IFileSignatureValidator`
```csharp
public interface IFileSignatureValidator
{
    bool IsValidSignature(byte[] headerBytes, string contentType, string fileExtension);
}
```

### 1.3 `IFileStorageService`
```csharp
public interface IFileStorageService
{
    Task<(string storagePath, string sha256Checksum, long fileSizeBytes)> SaveFileAsync(
        Stream fileStream,
        string fileName,
        Guid applicationId,
        CancellationToken ct = default);

    Task<Stream?> OpenReadStreamAsync(string storagePath, CancellationToken ct = default);
}
```

### 1.4 `IApplicationIntakeService`
```csharp
public interface IApplicationIntakeService
{
    Task<AgentApplicationDto> CreateDraftAsync(CreateDraftApplicationCommand cmd, string createdBy, CancellationToken ct = default);
    Task<AgentApplicationDto> UpdateDraftAsync(Guid applicationId, UpdateDraftApplicationCommand cmd, string updatedBy, CancellationToken ct = default);
    Task<AttachmentDto> UploadAttachmentAsync(Guid applicationId, UploadAttachmentCommand cmd, string uploadedBy, CancellationToken ct = default);
    Task<bool> DeleteAttachmentAsync(Guid applicationId, Guid attachmentId, string deletedBy, CancellationToken ct = default);
    Task<AgentApplicationDto> SubmitApplicationAsync(Guid applicationId, string submittedBy, CancellationToken ct = default);
}
```

---

## 2. Dependency Injection Registration

```csharp
services.AddScoped<IApplicationNumberGenerator, ApplicationNumberGenerator>();
services.AddSingleton<IFileSignatureValidator, FileSignatureValidator>();
services.AddScoped<IFileStorageService, LocalDiskFileStorageService>();
services.AddScoped<IApplicationIntakeService, ApplicationIntakeService>();
```
