using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Domain.Interfaces
{
    public interface ITaskHistoryRepository : IGenericRepository<TaskHistory>
    {
        Task<IReadOnlyList<TaskHistory>> GetByTaskIdAsync(int taskId);
    }
}
