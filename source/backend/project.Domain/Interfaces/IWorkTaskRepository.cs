using project.Domain.Models;

namespace project.Domain.Interfaces
{
    public interface IWorkTaskRepository : IGenericRepository<WorkTask>
    {
        Task<List<WorkTask>> GetTasksByGroupIdAsync(int groupId, TasksStatus? taskStatus = null, TaskPriority? taskPriority = null);
        Task<List<WorkTask>> GetTasksByUserIdAsync(int userId, int? groupId = null, TasksStatus? taskStatus = null, TaskPriority? taskPriority = null);
        Task<WorkTask?> GetWithCreatorAndAssigneeByIdAsync(int id);
        Task<List<WorkTask>> GetOverdueTasksByGroupIdAsync(int groupId);
    }
}