using Microsoft.Extensions.Caching.Distributed;
using project.Application.Interfaces.CachedModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Caching
{
    public class CacheInvalidator : ICacheInvalidator
    {
        private readonly IDistributedCache _cache;
        public CacheInvalidator(IDistributedCache cache) => _cache = cache;
        public Task InvalidateGroupAsync(int groupId, CancellationToken ct = default)
            => Task.WhenAll(
                _cache.RemoveAsync(GroupCacheKeys.Entity(groupId), ct),
                _cache.RemoveAsync(GroupCacheKeys.Detail(groupId), ct),
                _cache.RemoveAsync(GroupCacheKeys.WithMember(groupId), ct),
                _cache.RemoveAsync(GroupCacheKeys.WithTaskMember(groupId), ct));

        public Task InvalidateUserAsync(int userId, CancellationToken ct = default)
            => _cache.RemoveAsync(UserCachedKey.Entity(userId), ct);

        public Task InvalidateTaskAsync(int taskId, CancellationToken ct = default)
            => _cache.RemoveAsync(TaskCacheKeys.Entity(taskId), ct);
    }
}
