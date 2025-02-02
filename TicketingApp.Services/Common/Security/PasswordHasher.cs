using System;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace TicketingApp.Services.Common.Security;

public class PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 128 / 8;
    private const int HashSize = 256 / 8;
    private const int Iterations = 10000;
    private const KeyDerivationPrf Prf = KeyDerivationPrf.HMACSHA256;

    public string HashPassword(string password)
    {
        byte[] salt = new byte[SaltSize];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        byte[] hash = KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: Prf,
            iterationCount: Iterations,
            numBytesRequested: HashSize
        );

        byte[] combined = new byte[SaltSize + HashSize];
        Buffer.BlockCopy(salt, 0, combined, 0, SaltSize);
        Buffer.BlockCopy(hash, 0, combined, SaltSize, HashSize);

        return Convert.ToBase64String(combined);
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        byte[] combined = Convert.FromBase64String(hashedPassword);

        byte[] salt = new byte[SaltSize];
        byte[] hash = new byte[HashSize];
        Buffer.BlockCopy(combined, 0, salt, 0, SaltSize);
        Buffer.BlockCopy(combined, SaltSize, hash, 0, HashSize);

        byte[] newHash = KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: Prf,
            iterationCount: Iterations,
            numBytesRequested: HashSize
        );

        return CryptographicOperations.FixedTimeEquals(hash, newHash);
    }
}
