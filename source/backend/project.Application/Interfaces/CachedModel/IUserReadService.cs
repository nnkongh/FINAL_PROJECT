using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Interfaces.CachedModel
{
    public interface IUserReadService
    {
        Task<UserCachedDto?> GetByIdAsync(int id, CancellationToken ct = default);
    }
    public record UserCachedDto(int Id, string UserName, string? MSSV, string Email, UserRole UserRole, string? AvatarUrl, bool IsActive);
}
