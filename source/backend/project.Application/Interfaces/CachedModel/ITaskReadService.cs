using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Interfaces.CachedModel
{
    public interface ITaskReadService
    {
        Task<List<TaskSimpleCacheModel>> GetTasksByGroupIdAsync(int groupId, TasksStatus? taskStatus = null, TaskPriority? taskPriority = null);
        Task<List<TaskSimpleCacheModel>> GetTasksByUserIdAsync(int userId, int? groupId = null, TasksStatus? taskStatus = null, TaskPriority? taskPriority = null);
        Task<TaskCreatorAndAssigneeModel?> GetWithCreatorAndAssigneeByIdAsync(int id);
        Task<List<TaskSimpleCacheModel>> GetOverdueTasksByGroupIdAsync(int groupId);
    }

    public record TaskCacheModel(int Id, string? Title, string? Description, TasksStatus Status, bool IsOVerdue, bool IsAssigned, TimeSpan? Duration);
    public record TaskSimpleCacheModel(int Id, string? Title, string? Description, int CreatedBy, int? AssigneTo, DateTime CreatedAt);
    public record TaskCreatorAndAssigneeModel(int Id, int GroupId, string? Title, string? Description,
                                            int CreatedBy, int? AssigneTo, DateTime CreatedAt,
                                            TasksStatus TaskStatus, TaskPriority TaskPriority,
                                            DateTime? StartDate, DateTime? DueDate, TimeSpan? Duration,
                                            DateTime? CompletedAt, UserSimpleModel Creator, UserSimpleModel Assignee);
    public record UserSimpleModel(int? Id, string? Name, string? UserCode);
}

public class TaskModel
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsOverdue { get; set; }
    public bool IsAssigned { get; set; }
    public TimeSpan? Duration { get; set; }
    public string Priority { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int GroupId { get; set; }
    public int? AssignedTo { get; set; }
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}