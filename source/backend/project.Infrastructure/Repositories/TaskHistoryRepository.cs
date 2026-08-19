using project.Domain.Interfaces;
using project.Domain.Models;
using project.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Repositories
{
    public class TaskHistoryRepository : GenericRepository<TaskHistory>, ITaskHistoryRepository
    {
        public TaskHistoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<TaskHistory>> GetByTaskIdAsync(int taskId)
        {
            return await _context.TaskHistories.Where(th => th.TaskId == taskId).ToListAsync();
        }
    }
}
