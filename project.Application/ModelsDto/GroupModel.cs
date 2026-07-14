using project.Application.ModelsDto.DomainModelsDto;
using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.ModelsDto
{
    public class GroupDetailModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SubjectOrProjectName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedBy { get; set; }
        public MajorType MajorType { get; set; }
        public string? GithubRepoUrl { get; set; }
        public int ActiveMemberCount { get; set; }
        public int InProgressTasks { get; set; }
        public int TestTasks { get; set; }
        public int TodoTasks { get; set; }
        public int OverdueTasks { get; set; }
        public int DoneTasks { get; set; }
        public int TotalTaskCount { get; set; }
    }
    public class GroupModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SubjectOrProjectName { get; set; } = string.Empty;
        public MajorType MajorType { get; set; }
        public int LimitedUser { get; set; }
        public bool IsActive { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int ClassRoomId { get; set; }
        public int TotalMemberCount { get; set; }
        public int TotalTasksDone { get; set; }
        public int TotalTasks { get; set; }
        public string? GithubRepoUrl { get; set; }
    }
    public class GroupMemModel
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserCode { get; set; } = string.Empty;
        public bool LinkedGithubAccount { get; set; }
        public string? GithubUserName { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsActive { get; set; }
        public string Role { get; set; } = string.Empty; // Leader/Member
        public int Contribution { get; set; }
        public DateTime JoinedAt { get; set; }
    }

    public class GroupReportModel
    {
        public string GroupName { get; set; }
        public DateTime ExportedAt { get; set; }
        public List<MemberReportModel> Members { get; set; } = new();
    }

    public class MemberReportModel
    {
        public string Name { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int TodoTasks { get; set; }
        public int OverdueTasks { get; set; }
        public int TestTasks { get; set; }
        public double ContributionScore { get; set; }
    }
    public class GroupSummaryModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string SubjectName { get; set; }
        public int MemberCount { get; set; }
        public int LimitedUser { get; set; }
        public bool IsMyGroup { get; set; }
        public GroupProgressModel? Progress { get; set; }
    }
    public class GroupProgressModel
    {
        public int TotalTasks { get; set; }
        public int DoneTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int TodoTasks { get; set; }
        public int TestTasks { get; set; }
    }
}
