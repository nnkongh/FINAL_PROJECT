using Microsoft.EntityFrameworkCore;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Infrastructure.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Repositories
{
    public class WorkTaskRepository : GenericRepository<WorkTask>, IWorkTaskRepository
    {
        public WorkTaskRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<WorkTask>> GetOverdueTasksByGroupIdAsync(int groupId)
        {
            return await _context.WorkTask.Where(x => x.GroupId == groupId && x.DueDate < DateTime.UtcNow && x.Status != TasksStatus.Done).ToListAsync();
        }

        public async Task<List<WorkTask>> GetTasksByGroupIdAsync(int groupId, TasksStatus? taskStatus = null, TaskPriority? taskPriority = null)
        {
            return await _context.WorkTask
                .Where(x => x.GroupId == groupId)
                .Where(t => taskStatus == null || t.Status == taskStatus)
                .Where(t => taskPriority == null || t.Priority == taskPriority)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }
        // duplicate code GetTasksByGroupIdAsync và GetTasksByUserIdAsync

        public async Task<List<WorkTask>> GetTasksByUserIdAsync( int userId, int? groupId = null, TasksStatus? taskStatus = null, TaskPriority? taskPriority = null)
        {
            return await _context.WorkTask
                .Where(t => groupId == null || t.GroupId == groupId)
                .Where(t => t.AssignedTo == userId)
                .Where(t => taskStatus == null || t.Status == taskStatus)
                .Where(t => taskPriority == null || t.Priority == taskPriority)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }



        //public async Task<List<WorkTask>> GetTasksWithGroupAndHistoryAndMemberByGroupIdAsync(int groupId)
        //{
        //    return await _context.WorkTask
        //        .Where(t => t.GroupId == groupId)
        //        .Include(t => t.Groups)
        //        .ThenInclude(g => g.Members)
        //        .ThenInclude(m => m.User)
        //        .Include(t => t.History)
        //        .OrderByDescending(t => t.CreatedAt)
        //        .ToListAsync();
        //}
        //

        //AI GENERATED
        //
        public async Task<WorkTask?> GetWithCreatorAndAssigneeByIdAsync(int id)
        {
            return await _context.WorkTask
                .Include(t => t.Creator)
                .Include(t => t.Assignee)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        //public async Task<WorkTask?> GetWithGroupAndHistorAndMemberyByIdAsync(int id)
        //{
        //    return await _context.WorkTask
        //        .Include(t => t.Groups)
        //        .ThenInclude(g => g.Members)
        //        .ThenInclude(m => m.User)
        //        .Include(t => t.History)
        //        .OrderByDescending(t => t.CreatedAt)
        //        .FirstOrDefaultAsync(t => t.Id == id);
        //}
    }
}
