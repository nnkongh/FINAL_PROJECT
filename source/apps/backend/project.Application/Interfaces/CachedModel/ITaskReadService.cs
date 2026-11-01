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
        Task<TaskCreatorAndAssigneeModel?> GetWithCreatorAndAssigneeByIdAsync(int id);
    }

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