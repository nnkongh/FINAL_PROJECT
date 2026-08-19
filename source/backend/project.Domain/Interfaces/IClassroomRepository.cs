using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Domain.Interfaces
{
    public interface IClassroomRepository : IGenericRepository<Classroom>
    {
        Task<IReadOnlyList<Classroom>> GetAllClassByUserIdAsync(int userId);
        Task<Classroom?> GetClassroomWithEnrollmentsAsync(int classId);
        Task<Classroom?> GetClassroomWithEnrollmentsAndGroupsAsync(int classId);
        Task<Classroom?> GetClassroomWithGroupsAsync(int classId);
        Task<Classroom?> GetByClassCodeWithEnrollmentsAsync(string classCode);
        Task<Classroom?> GetClassroomWithGroupsAndTasksAsync(int classId);
    }
}
