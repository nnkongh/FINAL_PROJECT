using project.Domain.Models;

namespace project.Presentation.Models
{
    public class CreateTaskRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        public TasksStatus TaskStatus { get; set; }
        public int? AssignedTo { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class UpdateTaskRequest
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public TaskPriority Priority { get; set; }
        public TasksStatus TaskStatus { get; set; }
        public int? AssignedTo { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class UpdateTaskStatusRequest
    {
        public TasksStatus NewStatus { get; set; }
    }

    public class AssignTaskRequest
    {
        public int AssignedTo { get; set; } // null = unassign
    }

    public class AddTaskLabelRequest
    {
        public int LabelId { get; set; }
    }

    public class RemoveTaskLabelRequest
    {
        public int LabelId { get; set; }
    }
    public class SetDueDateRequest
    {
        public DateTime DateTime { get; set; }
    }
}
