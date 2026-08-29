using System;
using System.Text;
using ManagedAgentBroker.Infrastructure.Services;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class FileSignatureValidatorTests
    {
        private readonly FileSignatureValidator _validator = new();

        [Fact]
        public void Valid_Pdf_Header_Must_Pass()
        {
            var pdfHeader = Encoding.ASCII.GetBytes("%PDF-1.7\nSample content");
            var result = _validator.IsValidSignature(pdfHeader, "application/pdf", ".pdf");
            Assert.True(result);
        }

        [Fact]
        public void Valid_Jpeg_Header_Must_Pass()
        {
            var jpegHeader = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46 };
            var result = _validator.IsValidSignature(jpegHeader, "image/jpeg", ".jpg");
            Assert.True(result);
        }

        [Fact]
        public void Valid_Png_Header_Must_Pass()
        {
            var pngHeader = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00 };
            var result = _validator.IsValidSignature(pngHeader, "image/png", ".png");
            Assert.True(result);
        }

        [Fact]
        public void Spoofed_Extension_With_Executable_Bytes_Must_Fail()
        {
            // Windows EXE MZ header masquerading as PDF
            var exeHeader = new byte[] { 0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00 };
            var result = _validator.IsValidSignature(exeHeader, "application/pdf", ".pdf");
            Assert.False(result);
        }

        [Fact]
        public void Corrupted_Header_Must_Fail()
        {
            var shortHeader = new byte[] { 0x00, 0x01 };
            var result = _validator.IsValidSignature(shortHeader, "application/pdf", ".pdf");
            Assert.False(result);
        }
    }
}
