using Microsoft.EntityFrameworkCore;
using project.Application.Interfaces.CachedModel;
using project.Infrastructure.Database;
using System.Threading.Tasks;

namespace project.Infrastructure.Caching
{
    public class UserReadService : IUserReadService 
    {
        private readonly ApplicationDbContext _context;
        public UserReadService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserCachedDto?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            return await _context.User.AsNoTracking().Where(u => u.Id == id)
                                .Select(u => new UserCachedDto(
                                    u.Id, u.UserName, u.UserCode, u.Email, u.UserRole, u.AvatarUrl, u.IsActive))
                                .FirstOrDefaultAsync(ct);
        }
    }
}
