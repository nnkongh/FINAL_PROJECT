using Microsoft.EntityFrameworkCore;
using project.Application.Interfaces.CachedModel;
using project.Domain.Models;
using project.Infrastructure.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Caching
{
    public class GroupReadService : IGroupReadService
    {
        private readonly ApplicationDbContext _db;
        public GroupReadService(ApplicationDbContext db) => _db = db;

        public Task<GroupCacheDto?> GetByIdWithDetailAsync(int id, CancellationToken ct = default)
        {
            var now = DateTime.UtcNow;

            return _db.Groups
                .AsNoTracking()
                .Where(g => g.Id == id)
                .Select(g => new GroupCacheDto(
                    g.Id,
                    g.Name,
                    g.SubjectOrProjectName,
                    g.IsActive,
                    g.CreatedAt,
                    g.CreatedBy,
                    g.MajorType,
                    g.LimitedUser,
                    g.ClassRoomId,
                    g.EnrollmentId,
                    g.GithubRepoUrl,
                    g.Members.Count(m => m.IsActive),
                    g.Tasks.Count(t => t.Status == TasksStatus.InProgress),
                    g.Tasks.Count(t => t.Status == TasksStatus.Test),
                    g.Tasks.Count(t => t.Status == TasksStatus.ToDo),
                    g.Tasks.Count(t => t.DueDate < now && t.Status != TasksStatus.Done),
                    g.Tasks.Count(t => t.Status == TasksStatus.Done),
                    g.Tasks.Count()))
                .FirstOrDefaultAsync(ct);
        }

        public Task<GroupMembersCacheDto?> GetByIdWithMemberAsync(int id, CancellationToken ct = default)
        {
            return _db.Groups
                    .AsNoTracking()
                    .Where(g => g.Id == id)
                    .Select(g => new GroupMembersCacheDto(
                        g.Id,
                        g.ClassRoomId,
                        g.GithubRepoUrl,
                        g.IsActive,
                        g.Members
                            .Where(m => m.IsActive)
                            .Select(m => new GroupMemberCacheDto(
                                m.UserId,
                                m.User.UserName,
                                m.User.Email,
                                m.Role,
                                m.IsActive))
                            .ToList()))
                    .FirstOrDefaultAsync(ct);
        }

        public Task<bool?> GetMemberActiveStatusAsync(int groupId, int userId, CancellationToken ct = default)
        {
            return _db.GroupMem.AsNoTracking().Where(g => g.Id == groupId && g.UserId == userId).Select(g => (bool?)g.IsActive).FirstOrDefaultAsync(ct);
        }
    }
}
