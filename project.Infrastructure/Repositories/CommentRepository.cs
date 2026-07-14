using Microsoft.EntityFrameworkCore;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Infrastructure.Database;
using System.Threading.Tasks;

namespace project.Infrastructure.Repositories
{
    public class CommentRepository : GenericRepository<Comment>, ICommentRepository
    {
        public CommentRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<Comment>> GetCommentsByTaskIdAsync(int taskId)
        {
            return await _context.Comment
                .Where(c => c.TaskId == taskId && !c.IsDeleted)
                .Include(c => c.User)
                .Include(c => c.Task)                       
                    .ThenInclude(t => t.Groups)              
                        .ThenInclude(g => g.Classroom)      
                .Include(c => c.Replies.Where(r => !r.IsDeleted))
                    .ThenInclude(r => r.User)
                .Include(c => c.Replies.Where(r => !r.IsDeleted))  
                    .ThenInclude(r => r.Task)                       
                        .ThenInclude(t => t.Groups)                  
                            .ThenInclude(g => g.Classroom)          
                .AsSplitQuery()
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }
    }
}
