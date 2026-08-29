using System;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IFileSignatureValidator
    {
        bool IsValidSignature(byte[] headerBytes, string contentType, string fileExtension);
    }
}
