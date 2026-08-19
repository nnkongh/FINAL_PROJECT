using Microsoft.Extensions.Caching.Distributed;
using project.Domain.Interfaces;
using project.Domain.Models;
using System.Text.Json;

namespace project.Infrastructure.Caching
{
    public class CachedTaskRepository : IWorkTaskRepository
    {
        private readonly IDistributedCache _cache;
        private readonly IWorkTaskRepository _inner;

        public CachedTaskRepository(IWorkTaskRepository inner, IDistributedCache cache)
        {
            _inner = inner;
            _cache = cache;
        }

        public async Task AddAsync(WorkTask entity)
        {
            await _inner.AddAsync(entity);
        }

        public async Task Delete(WorkTask entity)
        {
            await _inner.Delete(entity);
            await _cache.RemoveAsync($"task:{entity.Id}");
        }

        public async Task<IEnumerable<WorkTask>> GetAllAsync()
        {
            return await _inner.GetAllAsync();
        }

        public async Task<WorkTask?> GetByIdAsync(int id)
        {
            var cachedKey = $"task:{id}";
            var cached = await _cache.GetStringAsync(cachedKey);
            if (cached != null)
            {
                return JsonSerializer.Deserialize<WorkTask?>(cached);
            }
            var task = await _inner.GetByIdAsync(id);
            if (task != null)
            {
                await _cache.SetStringAsync(cachedKey, JsonSerializer.Serialize(task), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });
            }
            return task;
        }

        public async Task<List<WorkTask>> GetOverdueTasksByGroupIdAsync(int groupId)
        {
            return await _inner.GetOverdueTasksByGroupIdAsync(groupId);
        }

        public async Task<List<WorkTask>> GetTasksByGroupIdAsync(int groupId, TasksStatus? taskStatus = null, TaskPriority? taskPriority = null)
        {
            return await _inner.GetTasksByGroupIdAsync(groupId, taskStatus, taskPriority);
        }

        public async Task<List<WorkTask>> GetTasksByUserIdAsync(int userId, int? groupId = null, TasksStatus? taskStatus = null, TaskPriority? taskPriority = null)
        {
            return await _inner.GetTasksByUserIdAsync(userId, groupId, taskStatus, taskPriority);
        }

        public async Task<WorkTask?> GetWithCreatorAndAssigneeByIdAsync(int id)
        {
            return await _inner.GetWithCreatorAndAssigneeByIdAsync(id);
        }

        public async Task Update(WorkTask entity)
        {
            await _inner.Update(entity);
            await _cache.RemoveAsync($"task:{entity.Id}");
        }
    }
}
