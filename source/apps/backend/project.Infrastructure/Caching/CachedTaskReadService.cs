using Microsoft.Extensions.Caching.Distributed;
using project.Application.Interfaces.CachedModel;
using System.Text.Json;

namespace project.Infrastructure.Caching
{

    public static class TaskCacheKeys
    {
        public static string Entity(int id)
            => $"task:{id}";
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

        public async Task<TaskCreatorAndAssigneeModel?> GetWithCreatorAndAssigneeByIdAsync(
            int id)
        {
            var key = TaskCacheKeys.Entity(id);

            var cached = await _cache.GetStringAsync(key);

            if (cached is not null)
                return JsonSerializer.Deserialize<TaskCreatorAndAssigneeModel>(cached, _jsonOptions);

            var data = await _inner.GetWithCreatorAndAssigneeByIdAsync(id);

            if (data is not null)
                await _cache.SetStringAsync(
                    key,
                    JsonSerializer.Serialize(data, _jsonOptions),
                    Options
                );

            return data;
        }
    }
}
