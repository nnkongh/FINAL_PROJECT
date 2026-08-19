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
    public class ClassroomRepository : GenericRepository<Classroom>, IClassroomRepository
    {
        public ClassroomRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<Classroom>> GetAllClassByUserIdAsync(int userId)
        {
            return await _context.Classrooms
                .Include(x => x.Groups)
                .Include(x => x.Enrollments)
                .Where(x => x.Enrollments.Any(e => e.UserId == userId))
                .AsSplitQuery()
                .ToListAsync();
        }

        public async Task<Classroom?> GetByClassCodeWithEnrollmentsAsync(string classCode)
        {
            return await _context.Classrooms
                .Include(c => c.Enrollments)
                .FirstOrDefaultAsync(x => x.ClassCode == classCode);
        }

        public async Task<Classroom?> GetClassroomWithEnrollmentsAndGroupsAsync(int classId)
        {
            return await _context.Classrooms
                .Include(x => x.Enrollments)
                .Include(x => x.Teacher)
                .Include(x => x.Groups).ThenInclude(x => x.Tasks)
                .Include(x => x.Groups).ThenInclude(x => x.Members)
                .AsSplitQuery()
                .FirstOrDefaultAsync(x => x.Id == classId);
        }

        public async Task<Classroom?> GetClassroomWithEnrollmentsAsync(int classId)
        {
            return await _context.Classrooms
                .Include(x => x.Enrollments)
                .ThenInclude(e => e.User)
                .Include(x => x.Groups)
                .Include(x => x.Teacher)
                .FirstOrDefaultAsync(x => x.Id == classId);
        }

        public async Task<Classroom?> GetClassroomWithGroupsAndTasksAsync(int classId)
        {
            return await _context.Classrooms
                .Include(x => x.Groups)
                .ThenInclude(x => x.Tasks)
                .Include(x => x.Enrollments)
                .FirstOrDefaultAsync(x => x.Id == classId);
        }

        public async Task<Classroom?> GetClassroomWithGroupsAsync(int classId)
        {
            return await _context.Classrooms
                .Include(x => x.Groups)
                .FirstOrDefaultAsync(x => x.Id == classId);
        }
    }
}
