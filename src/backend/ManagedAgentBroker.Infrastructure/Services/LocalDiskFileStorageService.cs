using System;
using System.IO;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public class LocalDiskFileStorageService : IFileStorageService
    {
        private readonly string _basePath;
        private readonly IFileSignatureValidator _signatureValidator;
        private readonly ILogger<LocalDiskFileStorageService> _logger;
        private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

        public LocalDiskFileStorageService(
            IConfiguration configuration,
            IFileSignatureValidator signatureValidator,
            ILogger<LocalDiskFileStorageService> logger)
        {
            _signatureValidator = signatureValidator;
            _logger = logger;
            _basePath = configuration["Storage:BasePath"] ?? "storage/attachments";
        }

        public async Task<(string storagePath, string sha256Checksum, long fileSizeBytes)> SaveFileAsync(
            Stream fileStream,
            string fileName,
            Guid applicationId,
            string contentType,
            CancellationToken ct = default)
        {
            if (fileStream == null)
                throw new ArgumentNullException(nameof(fileStream));

            var extension = Path.GetExtension(fileName);

            // Read the first 16 bytes for magic byte validation
            var headerBuffer = new byte[16];
            var bytesRead = await fileStream.ReadAsync(headerBuffer.AsMemory(0, 16), ct);
            if (bytesRead < 4 || !_signatureValidator.IsValidSignature(headerBuffer[..bytesRead], contentType, extension))
            {
                throw new InvalidOperationException($"Invalid file signature for content type '{contentType}' and extension '{extension}'.");
            }

            // Reset stream position if seekable, or create a combined stream
            Stream readStream;
            if (fileStream.CanSeek)
            {
                fileStream.Position = 0;
                readStream = fileStream;
            }
            else
            {
                // Prepend read bytes back to stream
                var headerStream = new MemoryStream(headerBuffer, 0, bytesRead);
                readStream = new CombinedStream(headerStream, fileStream);
            }

            var now = DateTime.UtcNow;
            var relativeDirectory = Path.Combine(now.Year.ToString(), now.Month.ToString("D2"), applicationId.ToString());
            var fullDirectory = Path.Combine(_basePath, relativeDirectory);

            if (!Directory.Exists(fullDirectory))
            {
                Directory.CreateDirectory(fullDirectory);
            }

            var attachmentId = Guid.NewGuid();
            var relativeFilePath = Path.Combine(relativeDirectory, $"{attachmentId}.dat");
            var fullFilePath = Path.Combine(_basePath, relativeFilePath);

            long totalBytes = 0;
            using var sha256 = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
            await using (var destinationStream = new FileStream(fullFilePath, FileMode.Create, FileAccess.Write, FileShare.None, 81920, true))
            {
                var buffer = new byte[81920];
                int count;
                while ((count = await readStream.ReadAsync(buffer.AsMemory(0, buffer.Length), ct)) > 0)
                {
                    totalBytes += count;
                    if (totalBytes > MaxFileSizeBytes)
                    {
                        // Clean up partial file
                        destinationStream.Close();
                        if (File.Exists(fullFilePath)) File.Delete(fullFilePath);
                        throw new InvalidOperationException($"Uploaded file exceeds the maximum allowed size of {MaxFileSizeBytes} bytes (10 MB).");
                    }

                    sha256.AppendData(buffer, 0, count);
                    await destinationStream.WriteAsync(buffer.AsMemory(0, count), ct);
                }
            }

            var hashBytes = sha256.GetHashAndReset();
            var sha256Hex = Convert.ToHexString(hashBytes).ToLowerInvariant();

            _logger.LogInformation("Stored file '{FileName}' for Application {AppId} at '{Path}' ({Bytes} bytes, SHA256: {Hash})",
                fileName, applicationId, relativeFilePath, totalBytes, sha256Hex);

            return (relativeFilePath, sha256Hex, totalBytes);
        }

        public Task<Stream?> OpenReadStreamAsync(string storagePath, CancellationToken ct = default)
        {
            var fullPath = Path.Combine(_basePath, storagePath);
            if (!File.Exists(fullPath))
            {
                return Task.FromResult<Stream?>(null);
            }

            Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read, 81920, true);
            return Task.FromResult<Stream?>(stream);
        }

        public Task<bool> DeleteFileAsync(string storagePath, CancellationToken ct = default)
        {
            var fullPath = Path.Combine(_basePath, storagePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }

        private sealed class CombinedStream : Stream
        {
            private readonly Stream _first;
            private readonly Stream _second;
            private bool _firstExhausted;

            public CombinedStream(Stream first, Stream second)
            {
                _first = first;
                _second = second;
            }

            public override bool CanRead => true;
            public override bool CanSeek => false;
            public override bool CanWrite => false;
            public override long Length => throw new NotSupportedException();
            public override long Position { get => throw new NotSupportedException(); set => throw new NotSupportedException(); }
            public override void Flush() => throw new NotSupportedException();
            public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
            public override void SetLength(long value) => throw new NotSupportedException();
            public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

            public override int Read(byte[] buffer, int offset, int count)
            {
                if (!_firstExhausted)
                {
                    int bytes = _first.Read(buffer, offset, count);
                    if (bytes > 0) return bytes;
                    _firstExhausted = true;
                }
                return _second.Read(buffer, offset, count);
            }

            public override async ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default)
            {
                if (!_firstExhausted)
                {
                    int bytes = await _first.ReadAsync(buffer, cancellationToken);
                    if (bytes > 0) return bytes;
                    _firstExhausted = true;
                }
                return await _second.ReadAsync(buffer, cancellationToken);
            }

            protected override void Dispose(bool disposing)
            {
                if (disposing)
                {
                    _first.Dispose();
                    _second.Dispose();
                }
                base.Dispose(disposing);
            }
        }
    }
}
