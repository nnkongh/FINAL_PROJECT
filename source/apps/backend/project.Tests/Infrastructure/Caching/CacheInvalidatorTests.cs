using FluentAssertions;
using Microsoft.Extensions.Caching.Distributed;
using Moq;
using project.Infrastructure.Caching;

namespace project.Tests.Infrastructure.Caching;

public class CacheInvalidatorTests
{
    private readonly Mock<IDistributedCache> _cache = new();
    private readonly CacheInvalidator _invalidator;

    public CacheInvalidatorTests()
    {
        _invalidator = new CacheInvalidator(_cache.Object);
    }

    [Fact]
    public async Task InvalidateGroupAsync_ShouldRemoveAllGroupKeys()
    {
        await _invalidator.InvalidateGroupAsync(7);

        var expectedKeys = new[]
        {
            GroupCacheKeys.Entity(7),
            GroupCacheKeys.Detail(7),
            GroupCacheKeys.WithMember(7),
            GroupCacheKeys.WithTaskMember(7)
        };

        foreach (var key in expectedKeys)
        {
            _cache.Verify(c => c.RemoveAsync(key, It.IsAny<CancellationToken>()), Times.Once);
        }
    }

    [Fact]
    public async Task InvalidateTaskAsync_ShouldRemoveTaskKey()
    {
        await _invalidator.InvalidateTaskAsync(42);

        _cache.Verify(c => c.RemoveAsync(TaskCacheKeys.Entity(42), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task InvalidateUserAsync_ShouldRemoveUserKey()
    {
        await _invalidator.InvalidateUserAsync(3);

        _cache.Verify(c => c.RemoveAsync(UserCachedKey.Entity(3), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public void GroupCacheKeys_ShouldProduceDistinctKeysPerShape()
    {
        var keys = new[]
        {
            GroupCacheKeys.Entity(7),
            GroupCacheKeys.Detail(7),
            GroupCacheKeys.WithMember(7),
            GroupCacheKeys.WithTaskMember(7)
        };

        keys.Should().OnlyHaveUniqueItems();
    }
}
