using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.Extensions.Caching.Distributed;
using project.Application.Interfaces.CachedModel;
using project.Domain.Interfaces;
using project.Domain.Models;
using System.Text.Json;

namespace project.Infrastructure.Caching
{

    public static class TaskCacheKeys
    {
        public static string Entity(int id)
            => $"task:{id}";

        public static string OverdueByGroup(int groupId)
            => $"task:overdue:group:{groupId}";

        public static string ByGroup(
            int groupId,
            TasksStatus? status,
            TaskPriority? priority)
            => $"task:group:{groupId}:status:{status}:priority:{priority}";

        public static string ByUser(
            int userId,
            int? groupId,
            TasksStatus? status,
            TaskPriority? priority)
            => $"task:user:{userId}:group:{groupId}:status:{status}:priority:{priority}";
    }
    public class CachedTaskReadService : ITaskReadService
    {
        private static readonly DistributedCacheEntryOptions Options = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        };

        private readonly ITaskReadService _inner;
        private readonly IDistributedCache _cache;

        private readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public CachedTaskReadService(
            ITaskReadService inner,
            IDistributedCache cache)
        {
            _inner = inner;
            _cache = cache;
        }

        private async Task<T?> GetCacheAsync<T>(
            string key,
            CancellationToken ct = default)
        {
            var cached = await _cache.GetStringAsync(key, ct);

            if (cached is null)
                return default;

            return JsonSerializer.Deserialize<T>(cached, _jsonOptions);
        }

        private async Task SetCacheAsync<T>(
            string key,
            T data,
            CancellationToken ct = default)
        {
            var json = JsonSerializer.Serialize(data, _jsonOptions);

            await _cache.SetStringAsync(
                key,
                json,
                Options,
                ct
            );
        }

        public async Task<List<TaskSimpleCacheModel>> GetOverdueTasksByGroupIdAsync(
            int groupId)
        {
            var key = TaskCacheKeys.OverdueByGroup(groupId);

            var cached = await GetCacheAsync<List<TaskSimpleCacheModel>>(key);

            if (cached is not null)
                return cached;

            var data = await _inner.GetOverdueTasksByGroupIdAsync(groupId);

            await SetCacheAsync(key, data);

            return data;
        }

        public async Task<List<TaskSimpleCacheModel>> GetTasksByGroupIdAsync(
            int groupId,
            TasksStatus? taskStatus = null,
            TaskPriority? taskPriority = null)
        {
            var key = TaskCacheKeys.ByGroup(
                groupId,
                taskStatus,
                taskPriority
            );

            var cached = await GetCacheAsync<List<TaskSimpleCacheModel>>(key);

            if (cached is not null)
                return cached;

            var data = await _inner.GetTasksByGroupIdAsync(
                groupId,
                taskStatus,
                taskPriority
            );

            await SetCacheAsync(key, data);

            return data;
        }

        public async Task<List<TaskSimpleCacheModel>> GetTasksByUserIdAsync(
            int userId,
            int? groupId = null,
            TasksStatus? taskStatus = null,
            TaskPriority? taskPriority = null)
        {
            var key = TaskCacheKeys.ByUser(
                userId,
                groupId,
                taskStatus,
                taskPriority
            );

            var cached = await GetCacheAsync<List<TaskSimpleCacheModel>>(key);

            if (cached is not null)
                return cached;

            var data = await _inner.GetTasksByUserIdAsync(
                userId,
                groupId,
                taskStatus,
                taskPriority
            );

            await SetCacheAsync(key, data);

            return data;
        }

        public async Task<TaskCreatorAndAssigneeModel?> GetWithCreatorAndAssigneeByIdAsync(
            int id)
        {
            var key = TaskCacheKeys.Entity(id);

            var cached = await GetCacheAsync<TaskCreatorAndAssigneeModel>(key);

            if (cached is not null)
                return cached;

            var data = await _inner.GetWithCreatorAndAssigneeByIdAsync(id);

            if (data is not null)
                await SetCacheAsync(key, data);

            return data;
        }
    }
}
