using Microsoft.EntityFrameworkCore;
using project.Application.Interfaces.CachedModel;
using project.Domain.Models;
using project.Infrastructure.Database;

namespace project.Infrastructure.Caching
{
    public class TaskReadService : ITaskReadService
    {
        private readonly ApplicationDbContext _context;
        public TaskReadService(ApplicationDbContext context) => _context = context;
        public async Task<List<TaskSimpleCacheModel>> GetOverdueTasksByGroupIdAsync(int groupId)
        {
            return await _context.WorkTask.AsNoTracking().Where(g => g.GroupId == groupId && g.IsOverdue())
                                .Select(t => new TaskSimpleCacheModel(t.Id, t.Title, t.Description, t.CreatedBy,t.AssignedTo,t.CreatedAt))
                                .ToListAsync();
        }

        public async Task<List<TaskSimpleCacheModel>> GetTasksByGroupIdAsync(int groupId, TasksStatus? taskStatus = null, TaskPriority? taskPriority = null)
        {
            return await _context.WorkTask.AsNoTracking().Where(t => t.GroupId == groupId && t.Status == taskStatus && t.Priority == taskPriority)
                                .Select(t => new TaskSimpleCacheModel(t.Id, t.Title, t.Description, t.CreatedBy, t.AssignedTo, t.CreatedAt))
                                .ToListAsync();
        }

        public async Task<List<TaskSimpleCacheModel>> GetTasksByUserIdAsync(int userId, int? groupId = null, TasksStatus? taskStatus = null, TaskPriority? taskPriority = null)
        {
            return await _context.WorkTask.AsNoTracking().Where(t => t.GroupId == groupId && t.Status == taskStatus && t.Priority == taskPriority && t.AssignedTo == userId)
                              .Select(t => new TaskSimpleCacheModel(t.Id, t.Title, t.Description, t.CreatedBy, t.AssignedTo, t.CreatedAt))
                              .ToListAsync();
        }

        public async Task<TaskCreatorAndAssigneeModel?> GetWithCreatorAndAssigneeByIdAsync(int id)
        {
            return await _context.WorkTask.AsNoTracking().Where(t => t.Id == id)
                              .Select(t => new TaskCreatorAndAssigneeModel(t.Id, t.GroupId,t.Title, t.Description, t.CreatedBy, t.AssignedTo, t.CreatedAt,
                                                                           t.Status,t.Priority,t.StartDate,t.DueDate,t.Duration,t.CompletedAt,
                                                                            new UserSimpleModel(t.Creator.Id, t.Creator.UserName, t.Creator.UserCode!),
                                                                            new UserSimpleModel(t.Assignee.Id, t.Assignee.UserName, t.Creator.UserCode!)))
                              .FirstOrDefaultAsync();
        }
    }
}
