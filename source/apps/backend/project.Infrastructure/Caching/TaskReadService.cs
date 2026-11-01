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
