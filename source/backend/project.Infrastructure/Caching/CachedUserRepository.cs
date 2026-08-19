using Microsoft.Extensions.Caching.Distributed;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System.Text.Json;

namespace project.Infrastructure.Caching
{
    public class CachedUserRepository : IUserRepository
    {
        private readonly IUserRepository _inner;
        private readonly IDistributedCache _cache;

        public CachedUserRepository(IUserRepository inner, IDistributedCache cache)
        {
            _cache = cache;
            _inner = inner;
        }

        public async Task AddAsync(UserApp entity)
        {
            await _inner.AddAsync(entity);
        }

        public async Task AddRangeAsync(IEnumerable<UserApp> users)
        {
            await _inner.AddRangeAsync(users);
        }

        public async Task Delete(UserApp entity)
        {
            await _inner.Delete(entity);
            await _cache.RemoveAsync($"user:{entity.Id}");
        }

        public async Task<UserApp?> FindByEmailAsync(string email)
        {
            return await _inner.FindByEmailAsync(email);
        }

        public async Task<UserApp?> FindByUserCode(string userCode)
        {
            return await _inner.FindByUserCode(userCode);
        }

        public async Task<PagedResult<UserApp>> GetAllAsync(UserRole? userRole, int page, int pageSize)
        {
            return await _inner.GetAllAsync(userRole, page, pageSize);
        }

        public async Task<IEnumerable<UserApp>> GetAllAsync()
        {
            return await _inner.GetAllAsync();
        }

        public async Task<UserApp?> GetByGithubIdAsync(long Id)
        {
            return await _inner.GetByGithubIdAsync(Id);
        }

        public async Task<UserApp?> GetByIdAsync(int id)
        {
            var cachedKey = $"user:{id}";
            var cached = await _cache.GetStringAsync(cachedKey);
            if (cached != null)
            {
                return JsonSerializer.Deserialize<UserApp>(cached);
            }
            var user = await _inner.GetByIdAsync(id);
            if (user != null)
            {
                await _cache.SetStringAsync(cachedKey, JsonSerializer.Serialize(user), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });
            }
            return user;
        }

        public async Task<string> GetRoleAsync(int id)
        {
            return await _inner.GetRoleAsync(id);
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _inner.IsEmailExistsAsync(email);
        }

        public async Task<List<UserApp>> SearchAsync(string keyword)
        {
            return await _inner.SearchAsync(keyword);
        }

        public async Task Update(UserApp entity)
        {
            await _inner.Update(entity);
            await _cache.RemoveAsync($"user:{entity.Id}");
        }
    }
}
