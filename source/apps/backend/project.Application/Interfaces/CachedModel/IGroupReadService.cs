using AutoMapper.Execution;
using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Interfaces.CachedModel
{
    public interface IGroupReadService
    {
        Task<GroupCacheDto?> GetByIdWithDetailAsync(int id, CancellationToken ct = default);
        Task<GroupMembersCacheDto?> GetByIdWithMemberAsync(int id,CancellationToken ct = default);
        Task<bool?> GetMemberActiveStatusAsync(int groupId, int userId, CancellationToken ct = default);
    }
    public record GroupCacheDto(
   int Id,
   string Name,
   string SubjectOrProjectName,
   bool IsActive,
   DateTime CreatedAt,
   int CreatedBy,
   MajorType MajorType,
   int Limit,
   int ClassroomId,
   int? EnrollmentId,
   string? GithubRepoUrl,
   int ActiveMemberCount,
   int InProgressTasks,
   int TestTasks,
   int TodoTasks,
   int OverdueTasks,
   int DoneTasks,
   int TotalTaskCount);

    public record GroupMemberCacheDto(
     int UserId,
     string FullName,
     string? Email,
     GroupMemberRole Role,
     bool IsActive
     );

    public record GroupMembersCacheDto(
        int GroupId,
        int ClassRoomId,
        string? GithubRepoUrl,
        bool IsActive,
        IReadOnlyList<GroupMemberCacheDto> Members)
    {
        public GroupMemberCacheDto? FindMember(int userId)
      => Members.FirstOrDefault(m => m.UserId == userId);

    }

}
