using Microsoft.EntityFrameworkCore;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Infrastructure.Database;
using System.Text.RegularExpressions;

namespace project.Infrastructure.Repositories
{
    public class GroupRepository : GenericRepository<Groups>, IGroupRepository
    {
        public GroupRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<Groups>> GetAllGroupsByClassId(int classId)
        {
            return await _context.Groups
                .Where(x => x.ClassRoomId == classId)
                .ToListAsync();
        }

        public async Task<List<Groups>> GetAllGroupsByUserIdAsync(int userId)
        {
            return await _context.Groups
               .Where(x => x.Members.Any(x => x.UserId == userId && x.IsActive) && x.Classroom.Enrollments.Any(e => e.UserId == userId && e.IsActive))
               .Include(g => g.Members.Where(x => x.IsActive))
               .ThenInclude(g => g.User)
               .Include(g => g.Classroom)
               .Include(g => g.Tasks)
               .ToListAsync();
        }

        public async Task<Groups?> GetByIdWithDetailAsync(int id)
        {
            return await _context.Groups.
                        Include(c => c.Members).
                        ThenInclude(c => c.User).
                        Include(c => c.Tasks).
                        AsSplitQuery().
                        FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Groups?> GetByIdWithMemberAsync(int id)
        {
            return await _context.Groups.
                        Include(c => c.Members).
                        ThenInclude(c => c.User).
                        AsSplitQuery().
                        FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Groups?> GetByIdWithTaskMemberAsync(int id)
        {
            return await _context.Groups
                        .Include(g => g.Members.Where(m => m.IsActive))
                        .ThenInclude(m => m.User)
                        .ThenInclude(m => m.AssignedTasks)
                        .AsSplitQuery()
                        .FirstOrDefaultAsync(g => g.Id == id);
        }

        public async Task<List<Groups>> GetGroupsWithTasksByIdClassIdAsync(int classRoomId)
        {
            return await _context.Groups
                .AsNoTracking()
                .Where(g => g.ClassRoomId == classRoomId)
                .Include(g => g.Tasks)
                .Include(g => g.Members.Where(m => m.IsActive))
                .ThenInclude(m => m.User)
                .ThenInclude(m => m.AssignedTasks)
                .AsSplitQuery()
                .ToListAsync();
        }

        //public async Task<IReadOnlyList<Groups>> GetTasksInGroupsByClassIdAsync(int classId)
        //{
        //    return await _context.Groups
        //                .Include(m => m.Tasks)
        //                .Where(m => m.ClassRoomId == classId))
        //                .ToListAsync();
        //}
    }
}
