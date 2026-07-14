using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.Extensions.Caching.Distributed;
using project.Domain.Interfaces;
using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace project.Infrastructure.Caching
{
    public class CachedGroupRepository : IGroupRepository
    {
        private readonly IGroupRepository _inner;
        private readonly IDistributedCache _cache;

        public CachedGroupRepository(IGroupRepository inner, IDistributedCache cache)
        {
            _inner = inner;
            _cache = cache;
        }

        public async Task AddAsync(Groups entity)
        {
            await _inner.AddAsync(entity);
        }

        public async Task Delete(Groups entity)
        {
            await _inner.Delete(entity);
            await _cache.RemoveAsync($"group:{entity.Id}:task:member");
            await _cache.RemoveAsync($"group:{entity.Id}:member");
            await _cache.RemoveAsync($"group:{entity.Id}:detail");
            await _cache.RemoveAsync($"group:{entity.Id}");
        }

        public async Task<IEnumerable<Groups>> GetAllAsync()
        {
            var cachedKey = $"groups";
            var cached = await _cache.GetAsync(cachedKey);
            if (cached != null)
            {
                var json = JsonSerializer.Deserialize<IEnumerable<Groups>>(cached);
                if (json != null)
                {
                    return json.ToList();
                }
            }
            var groups = await _inner.GetAllAsync();
            if (groups != null)
            {
                await _cache.SetStringAsync(cachedKey, JsonSerializer.Serialize(groups), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });
            }
            return groups ?? new List<Groups>();
        }

        public async Task<IReadOnlyList<Groups>> GetAllGroupsByClassId(int classId)
        {
            var groups = await _inner.GetAllGroupsByClassId(classId);
            return groups ?? new List<Groups>();
        }

        public async Task<List<Groups>> GetAllGroupsByUserIdAsync(int userId)
        {
            var groups = await _inner.GetAllGroupsByUserIdAsync(userId);
            return groups ?? new List<Groups>();
        }

        public async Task<Groups?> GetByIdAsync(int id)
        {
            //  Kiểm tra cache trước, nếu có thì sẽ serial cached đó ra kiểu group
            // Nếu không có thì sẽ gọi Db, sau đó mới set key;
            var cachedKey = $"group:{id}";
            var cached = await _cache.GetStringAsync(cachedKey);
            if (cached != null)
            {
                return JsonSerializer.Deserialize<Groups>(cached);
            }
            var group = await _inner.GetByIdAsync(id);
            if (group != null)
            {
                await _cache.SetStringAsync(cachedKey,JsonSerializer.Serialize(group), new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5) });
            }
            return group;
        }

        public async Task<Groups?> GetByIdWithDetailAsync(int id)
        {
            var cachedKey = $"group:{id}:detail";
            var cached = await _cache.GetStringAsync(cachedKey);
            if ( cached != null)
            {
                return JsonSerializer.Deserialize<Groups>(cached);
            }
            var group = await _inner.GetByIdWithDetailAsync(id);
            if (group != null)
            {
                await _cache.SetStringAsync(cachedKey,JsonSerializer.Serialize(group), new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5) });
            }
            return group;
        }


        public async Task<Groups?> GetByIdWithMemberAsync(int id)
        {
            var cachedKey = $"group:{id}:member";
            var cached = await _cache.GetStringAsync(cachedKey);
            if (cached != null)
            {
                return JsonSerializer.Deserialize<Groups>(cached);
            }
            var groupMem = await _inner.GetByIdWithMemberAsync(id);
            if (groupMem != null)
            {
                await _cache.SetStringAsync(cachedKey, JsonSerializer.Serialize(groupMem), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });
            }
            return groupMem;
        }

        public async Task<Groups?> GetByIdWithTaskMemberAsync(int id)
        {
            var cachedKey = $"group:{id}:task:member";
            var cached = await _cache.GetStringAsync(cachedKey);
            if (cached != null)
            {
                return JsonSerializer.Deserialize<Groups>(cached);
            }
            var groupTaskMem = await _inner.GetByIdWithTaskMemberAsync(id);
            if (groupTaskMem != null)
            {
                await _cache.SetStringAsync(cachedKey,JsonSerializer.Serialize(groupTaskMem), new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5) });
            }
            return groupTaskMem;
        }

        public async Task<List<Groups>> GetGroupsWithTasksByIdClassIdAsync(int classRoomId)
        {
            var cachedKey = $"class:{classRoomId}:groups:tasks";
            var cached = await _cache.GetStringAsync(cachedKey);
            if (cached != null)
            {
                var groups = JsonSerializer.Deserialize<List<Groups>>(cached);
                if (groups != null)
                {
                    return groups;
                }
            }
            var listGroups = await _inner.GetGroupsWithTasksByIdClassIdAsync(classRoomId);
            if (listGroups != null)
            {
                await _cache.SetStringAsync(cachedKey, JsonSerializer.Serialize(listGroups), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });
            }
            return listGroups ?? new List<Groups>();
        }

        public async Task Update(Groups entity)
        {
            await _inner.Update(entity);
            await _cache.RemoveAsync($"group:{entity.Id}:task:member");
            await _cache.RemoveAsync($"group:{entity.Id}:member");
            await _cache.RemoveAsync($"group:{entity.Id}:detail");
            await _cache.RemoveAsync($"group:{entity.Id}");
            
        }
    }
}
