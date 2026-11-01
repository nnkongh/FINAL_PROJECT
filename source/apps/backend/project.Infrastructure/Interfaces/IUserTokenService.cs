using project.Domain.Models;

namespace project.Infrastructure.Interfaces
{
    public interface IUserTokenService
    {
        Task<string> GeneratePasswordTokenAsync(UserApp user);
        Task<bool> ResetPasswordAsync(UserApp user, string token, string newPassword);
    }
}
