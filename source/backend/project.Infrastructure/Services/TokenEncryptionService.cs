using Microsoft.AspNetCore.DataProtection;
using project.Application.Interfaces;

namespace project.Infrastructure.Services
{
    public class TokenEncryptionService : ITokenEncryptionService
    {
        private readonly IDataProtector _protector;

        public TokenEncryptionService(IDataProtectionProvider provider)
        {
            _protector = provider.CreateProtector("GitHubAccessToken.v1");
        }

        public string Encrypt(string plainText)
        {
            return _protector.Protect(plainText);
        }

        public string Decrypt(string cipherText)
        {
            return _protector.Unprotect(cipherText);
        }
    }
}
