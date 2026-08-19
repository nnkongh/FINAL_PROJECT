using project.Domain.Models;

namespace project.Domain.Interfaces
{
    public interface IReportRepository : IGenericRepository<Report>
    { 
        Task<IReadOnlyList<Report>> GetReportsByGroupIdAsync(int groupId);
    }
}
