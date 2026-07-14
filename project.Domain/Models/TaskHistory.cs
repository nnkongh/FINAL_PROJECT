using project.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Domain.Models
{
    public class TaskHistory
    {
        public int Id { get; private set; }
        public int TaskId { get; private set; }
        public int ChangedBy { get; private set; }
        public TasksStatus? OldStatus { get; private set; }
        public TasksStatus? NewStatus { get; private set; }
        public DateTime ChangedAt { get; private set; } = DateTime.UtcNow;
        public WorkTask Task { get; private set; }
        public UserApp User { get; private set; }

        private TaskHistory() { }
        public static TaskHistory Create(WorkTask task, int changedBy,
            TasksStatus? oldStatus = null, TasksStatus? newStatus = null)
        {
            if (oldStatus != null && newStatus != null)
            {
                if (oldStatus == newStatus)
                throw new DomainException("Trạng thái mới phải khác trạng thái cũ");
            }

            return new TaskHistory
            {
                TaskId = task.Id,
                ChangedBy = changedBy,
                OldStatus = oldStatus,
                NewStatus = newStatus,
                ChangedAt = DateTime.UtcNow
            };
        }

    }
}
