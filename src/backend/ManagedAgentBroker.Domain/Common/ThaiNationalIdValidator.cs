namespace ManagedAgentBroker.Domain.Common;

/// <summary>
/// Validates 13-digit Thai National Identification Numbers using the standard Modulo 11 checksum algorithm.
/// </summary>
public static class ThaiNationalIdValidator
{
    /// <summary>
    /// Checks whether the provided string is a valid 13-digit Thai National ID.
    /// </summary>
    public static bool IsValid(string? nationalId)
    {
        if (string.IsNullOrWhiteSpace(nationalId))
            return false;

        // Clean digits
        var digits = nationalId.Trim();
        if (digits.Length != 13)
            return false;

        if (!digits.All(char.IsDigit))
            return false;

        // Modulo 11 Checksum calculation
        int sum = 0;
        for (int i = 0; i < 12; i++)
        {
            int digit = digits[i] - '0';
            int weight = 13 - i;
            sum += digit * weight;
        }

        int remainder = sum % 11;
        int checkDigit = (11 - remainder) % 10;
        int actualCheckDigit = digits[12] - '0';

        return checkDigit == actualCheckDigit;
    }

    /// <summary>
    /// Calculates the 13th check digit for a given 12-digit prefix.
    /// </summary>
    public static int CalculateCheckDigit(string twelveDigits)
    {
        if (twelveDigits.Length != 12 || !twelveDigits.All(char.IsDigit))
            throw new ArgumentException("Must provide exactly 12 numeric digits", nameof(twelveDigits));

        int sum = 0;
        for (int i = 0; i < 12; i++)
        {
            int digit = twelveDigits[i] - '0';
            int weight = 13 - i;
            sum += digit * weight;
        }

        int remainder = sum % 11;
        return (11 - remainder) % 10;
    }
}
