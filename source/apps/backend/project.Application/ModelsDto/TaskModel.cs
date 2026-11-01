using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.ModelsDto
{
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
    public class TaskHistoryModel
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public int ChangedBy { get; set; }
        public string OldStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; }
    }
    public class TaskOverDueModel
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int? AssignedTo { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
    }
}
