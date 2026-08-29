using ManagedAgentBroker.Infrastructure.Security.Cryptography;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace ManagedAgentBroker.Infrastructure.Persistence.Converters
{
    public class Aes256GcmValueConverter : ValueConverter<string, string>
    {
        public Aes256GcmValueConverter(IDataProtectionProvider provider)
            : base(
                plainText => provider.Encrypt(plainText),
                cipherText => provider.Decrypt(cipherText) ?? string.Empty)
        { }
    }
}
