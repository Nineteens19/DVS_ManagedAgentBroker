using System;
using System.Linq;
using FsCheck;
using FsCheck.Xunit;
using ManagedAgentBroker.Domain.Common;
using Xunit;

namespace ManagedAgentBroker.Infrastructure.Tests
{
    public class ThaiNationalIdValidatorPbtTests
    {
        [Property(DisplayName = "PBT-04: Any 12 numeric digits with correctly calculated check digit must be valid Modulo 11 ID")]
        public Property Valid_Calculated_ThaiNationalId_Must_Always_Be_Valid()
        {
            var digitGen = Gen.Elements('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
            var twelveDigitsGen = Gen.ArrayOf(12, digitGen).Select(arr => new string(arr));

            return Prop.ForAll(twelveDigitsGen.ToArbitrary(), twelveDigits =>
            {
                int checkDigit = ThaiNationalIdValidator.CalculateCheckDigit(twelveDigits);
                string fullId = $"{twelveDigits}{checkDigit}";

                bool isValid = ThaiNationalIdValidator.IsValid(fullId);
                return isValid;
            });
        }

        [Property(DisplayName = "PBT-04b: Corrupting the check digit on any valid ID must fail validation")]
        public Property Corrupted_Check_Digit_Must_Always_Be_Invalid()
        {
            var digitGen = Gen.Elements('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
            var twelveDigitsGen = Gen.ArrayOf(12, digitGen).Select(arr => new string(arr));

            return Prop.ForAll(twelveDigitsGen.ToArbitrary(), twelveDigits =>
            {
                int correctCheckDigit = ThaiNationalIdValidator.CalculateCheckDigit(twelveDigits);
                int corruptedCheckDigit = (correctCheckDigit + 1) % 10;
                string corruptedId = $"{twelveDigits}{corruptedCheckDigit}";

                bool isValid = ThaiNationalIdValidator.IsValid(corruptedId);
                return !isValid;
            });
        }

        [Theory]
        [InlineData(null, false)]
        [InlineData("", false)]
        [InlineData("12345", false)]
        [InlineData("12345678901234", false)]
        [InlineData("123456789012A", false)]
        public void EdgeCases_Must_Be_Rejected(string? input, bool expected)
        {
            var result = ThaiNationalIdValidator.IsValid(input);
            Assert.Equal(expected, result);
        }
    }
}
