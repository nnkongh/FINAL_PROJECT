using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using project.Application.Interfaces.CachedModel;
using project.Infrastructure.Database;
using System.Text.Json;

namespace project.Infrastructure.Caching
{


    public static class UserCachedKey
    {
        public static string Entity(int id) => $"user:{id}";
    }
    public class CachedUserReadService : IUserReadService
    {
        private static readonly DistributedCacheEntryOptions Options = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        };

        private readonly IUserReadService _inner;
        private readonly IDistributedCache _cache;

        public CachedUserReadService(IUserReadService inner, IDistributedCache cache)
            => (_inner, _cache) = (inner, cache);

        public async Task<UserCachedDto?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var key = UserCachedKey.Entity(id);
            var cached = await _cache.GetStringAsync(key, ct);
            if (cached is not null)
                return JsonSerializer.Deserialize<UserCachedDto>(cached);

            var dto = await _inner.GetByIdAsync(id,ct);
            if (dto is not null)

                await _cache.SetStringAsync(key, JsonSerializer.Serialize(dto), Options, ct);
            return dto;
        }
    }
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
