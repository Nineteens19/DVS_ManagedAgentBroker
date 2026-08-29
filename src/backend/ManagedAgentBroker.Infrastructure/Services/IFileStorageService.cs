using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IFileStorageService
    {
        Task<(string storagePath, string sha256Checksum, long fileSizeBytes)> SaveFileAsync(
            Stream fileStream,
            string fileName,
            Guid applicationId,
            string contentType,
            CancellationToken ct = default);

        Task<Stream?> OpenReadStreamAsync(string storagePath, CancellationToken ct = default);

        Task<bool> DeleteFileAsync(string storagePath, CancellationToken ct = default);
    }
}
