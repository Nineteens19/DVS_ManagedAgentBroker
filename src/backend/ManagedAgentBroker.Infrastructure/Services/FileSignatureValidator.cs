using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public class FileSignatureValidator : IFileSignatureValidator
    {
        private static readonly byte[] PdfMagic = { 0x25, 0x50, 0x44, 0x46 }; // %PDF
        private static readonly byte[] JpegMagic = { 0xFF, 0xD8, 0xFF };      // JPEG
        private static readonly byte[] PngMagic = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }; // PNG

        public bool IsValidSignature(byte[] headerBytes, string contentType, string fileExtension)
        {
            if (headerBytes == null || headerBytes.Length < 4)
                return false;

            var ext = fileExtension?.Trim().ToLowerInvariant() ?? string.Empty;
            var mime = contentType?.Trim().ToLowerInvariant() ?? string.Empty;

            if (ext == ".pdf" || mime == "application/pdf")
            {
                return MatchesMagic(headerBytes, PdfMagic);
            }

            if (ext == ".jpg" || ext == ".jpeg" || mime == "image/jpeg" || mime == "image/pjpeg")
            {
                return MatchesMagic(headerBytes, JpegMagic);
            }

            if (ext == ".png" || mime == "image/png" || mime == "image/x-png")
            {
                return MatchesMagic(headerBytes, PngMagic);
            }

            return false;
        }

        private static bool MatchesMagic(byte[] header, byte[] magic)
        {
            if (header.Length < magic.Length)
                return false;

            for (int i = 0; i < magic.Length; i++)
            {
                if (header[i] != magic[i])
                    return false;
            }

            return true;
        }
    }
}
