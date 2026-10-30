using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using project.Application.Interfaces.CachedModel;
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

    public static class GroupCacheKeys
    {
        public static string Detail(int id) => $"group:{id}:detail";
        public static string Entity(int id) => $"group:{id}";
        public static string WithMember(int id) => $"group:{id}:member";
        public static string WithTaskMember(int id) => $"group:{id}:task:member";
    }

    public class CachedGroupReadService : IGroupReadService
    {
        private static readonly DistributedCacheEntryOptions Options = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        };

        private readonly IGroupReadService _inner;
        private readonly IDistributedCache _cache;

        public CachedGroupReadService(IGroupReadService inner, IDistributedCache cache)
            => (_inner, _cache) = (inner, cache);

        public async Task<GroupCacheDto?> GetByIdWithDetailAsync(int id, CancellationToken ct = default)
        {
            var key = GroupCacheKeys.Detail(id);
            var cached = await _cache.GetStringAsync(key, ct);
            if (cached is not null)
                return JsonSerializer.Deserialize<GroupCacheDto>(cached);

            var dto = await _inner.GetByIdWithDetailAsync(id, ct);
            if (dto is null) return null;

            await _cache.SetStringAsync(key, JsonSerializer.Serialize(dto), Options, ct);
            return dto;
        }

        public async Task<GroupMembersCacheDto?> GetByIdWithMemberAsync(int id, CancellationToken ct = default)
        {
            var key = GroupCacheKeys.Detail(id);
            var cached = await _cache.GetStringAsync(key, ct);
            if (cached is not null)
                return JsonSerializer.Deserialize<GroupMembersCacheDto?>(cached);

            var dto = await _inner.GetByIdWithMemberAsync(id, ct);
            if (dto is null) return null;

            await _cache.SetStringAsync(key, JsonSerializer.Serialize(dto), Options, ct);
            return dto;
        }

        public async Task<bool?> GetMemberActiveStatusAsync(int groupId, int userId, CancellationToken ct = default)
        {
            var key = GroupCacheKeys.Detail(groupId);
            var cached = await _cache.GetStringAsync(key, ct);
            if (cached is not null)
                return true;

            var dto = await _inner.GetMemberActiveStatusAsync(groupId, userId, ct);
            if (dto is null) return false;
            return true;
        }
    }
}
