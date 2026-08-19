using project.Domain.Models;
using System.Text.RegularExpressions;

namespace project.Domain.Interfaces
{
    public interface IGroupRepository : IGenericRepository<Groups>
    {
        Task<Groups?> GetByIdWithMemberAsync(int id);
        Task<Groups?> GetByIdWithDetailAsync(int id);
        Task<List<Groups>> GetAllGroupsByUserIdAsync(int userId);
        Task<Groups?> GetByIdWithTaskMemberAsync(int id);
        Task<IReadOnlyList<Groups>> GetAllGroupsByClassId(int classId);
        Task<List<Groups>> GetGroupsWithTasksByIdClassIdAsync(int classRoomId);
        //Task<IReadOnlyList<Groups>> GetTasksGroupsByClassIdAsync(int classId);

    }
}
