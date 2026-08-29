using System;
using System.Security.Cryptography;

namespace ManagedAgentBroker.Infrastructure.Services
{
    public interface IPasswordHashService
    {
        string HashPassword(string password);
        bool VerifyPassword(string hashedPassword, string providedPassword);
    }

    public class PasswordHashService : IPasswordHashService
    {
        private const int SaltSize = 16;       // 128 bits
        private const int KeySize = 32;        // 256 bits
        private const int Iterations = 100000; // 100k iterations per RFC 2898 / NIST
        private static readonly HashAlgorithmName HashAlgorithm = HashAlgorithmName.SHA512;

        public string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("Password cannot be empty.", nameof(password));

            var salt = new byte[SaltSize];
            RandomNumberGenerator.Fill(salt);

            var key = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                Iterations,
                HashAlgorithm,
                KeySize);

            // Format: Base64(salt):Base64(key):iterations
            return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(key)}:{Iterations}";
        }

        public bool VerifyPassword(string hashedPassword, string providedPassword)
        {
            if (string.IsNullOrEmpty(hashedPassword) || string.IsNullOrEmpty(providedPassword))
                return false;

            var parts = hashedPassword.Split(':');
            if (parts.Length != 3)
                return false;

            try
            {
                var salt = Convert.FromBase64String(parts[0]);
                var expectedKey = Convert.FromBase64String(parts[1]);
                var iterations = int.Parse(parts[2]);

                var actualKey = Rfc2898DeriveBytes.Pbkdf2(
                    providedPassword,
                    salt,
                    iterations,
                    HashAlgorithm,
                    expectedKey.Length);

                return CryptographicOperations.FixedTimeEquals(actualKey, expectedKey);
            }
            catch
            {
                return false;
            }
        }
    }
}
