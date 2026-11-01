using project.Domain.Exceptions;

namespace project.Domain.Models
{
    public class WorkTask
    {
        public int Id { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string? Description { get; private set; } = string.Empty;
        public TasksStatus Status { get; private set; }
        public TaskPriority Priority { get; private set; } = TaskPriority.Medium;
        public DateTime? StartDate { get; private set; }
        public DateTime? DueDate { get; private set; }
        public DateTime? CompletedAt { get; private set; }
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;
        public int GroupId { get; private set; }
        public Groups Groups { get; private set; }
        public int? AssignedTo { get; private set; }
        public UserApp? Assignee { get; private set; }
        public UserApp Creator { get; private set; }
        public int CreatedBy { get; private set; }
        public bool? HasBranch { get; private set; }
        public ICollection<Comment> Comments => _comments.AsReadOnly();
        public ICollection<TaskHistory> History => _history.AsReadOnly();

        private readonly List<Comment> _comments = new List<Comment>();
        private readonly List<TaskHistory> _history = new List<TaskHistory>();

        private WorkTask() { }
        public static WorkTask Create(int groupId, string title, int createdBy, TasksStatus taskStatus, TaskPriority priority = TaskPriority.Medium, int? assignedTo = null, DateTime? duedate = null, string? description = null)
        {
            if (string.IsNullOrEmpty(title)) throw new DomainException("Tên tiêu đề không thể để trống");
            if (taskStatus != TasksStatus.InProgress && taskStatus != TasksStatus.ToDo) throw new DomainException("Trạng thái của task chỉ có thể là 'Todo' hoặc 'InProgress'");
            return new WorkTask
            {
                GroupId = groupId,
                Title = title,
                Description = description,
                CreatedBy = createdBy,
                Priority = priority,
                Status = taskStatus,
                StartDate = taskStatus == TasksStatus.InProgress ? DateTime.UtcNow : null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                DueDate = duedate,
                AssignedTo = assignedTo,
            };
            
        }
        public void ActivateBranch()
        {
            HasBranch = true;
        }
        public void DeactivateBranch()
        {
            HasBranch = false;
        }
        public void Assign(int userId)
        {
            if (Status == TasksStatus.Done) throw new DomainException($"Không thể bắt đầu với trạng thái {Status}");

            AssignedTo = userId;
            UpdatedAt = DateTime.UtcNow;
        }
        public void UnAssigned()
        {
            AssignedTo = null;
            UpdatedAt = DateTime.UtcNow;
        }
        public void Start()
        {
            if (Status != TasksStatus.ToDo)
            {
                throw new DomainException("Chỉ có thể bắt đầu công việc ở trạng thái 'To Do'");
            }
            Status = TasksStatus.InProgress;
            StartDate = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Complete()
        {
            if (Status != TasksStatus.Test) throw new DomainException("Chỉ có thể hoàn thành công việc ở trạng thái 'Test'");

            Status = TasksStatus.Done;
            CompletedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
        public void Test()
        {
            if (Status != TasksStatus.InProgress) throw new DomainException("Chỉ có thể test ở trạng thái 'In Progress'");
            Status = TasksStatus.Test;
            UpdatedAt = DateTime.UtcNow;
        }
        public void Reopen()
        {
            if (Status != TasksStatus.Done) throw new DomainException("Chỉ có thể mở lại nếu nhiệm vụ ở trạng thái 'Complete' ");

            Status = TasksStatus.InProgress;
            CompletedAt = null;
            UpdatedAt = DateTime.UtcNow;
        }
        public void Reject()
        {
            if (Status != TasksStatus.Test) throw new DomainException("Chỉ có thể từ chối task ở trạng thái 'Test'");

            Status = TasksStatus.InProgress;
            CompletedAt = null;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateDetails(string title, string? description, TaskPriority priority, TasksStatus taskStatus, DateTime? dueDate = null, int? assignedTo = null)
        {
            if (string.IsNullOrEmpty(title)) throw new DomainException("Tên tiêu đề không thể để trống");

            if (Status == TasksStatus.Done) throw new DomainException("Không thể cập nhật chi tiết khi công việc đã hoàn thành");

            Title = title;
            Description = description;
            Priority = priority;
            Status = taskStatus;
            UpdatedAt = DateTime.UtcNow;
            AssignedTo = assignedTo;
            DueDate = dueDate;

        }

        public void SetDueDate(DateTime dueDate)
        {
            if (dueDate < DateTime.UtcNow) throw new DomainException("Ngày đến hạn phải là ngày trong tương lai");

            DueDate = dueDate;
            UpdatedAt = DateTime.UtcNow;
        }

        public bool IsOverdue() => DueDate.HasValue && DueDate.Value < DateTime.UtcNow && Status != TasksStatus.Done;
        public bool IsAssigned() => AssignedTo.HasValue;
        public TimeSpan? Duration => CompletedAt.HasValue ? CompletedAt.Value - (StartDate ?? CreatedAt) : null;
    }
}
