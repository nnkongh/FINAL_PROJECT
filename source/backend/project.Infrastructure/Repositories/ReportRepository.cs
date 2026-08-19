using Microsoft.EntityFrameworkCore;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Infrastructure.Database;

namespace project.Infrastructure.Repositories
{
    public class ReportRepository : GenericRepository<Report>, IReportRepository
    {
        public ReportRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<Report>> GetReportsByGroupIdAsync(int groupId)
        {
            return await _context.Report
                                 .Where(r => r.GroupId == groupId)
                                 .Where(r => r.Status == ReportType.Completed)
                                 .OrderByDescending(c => c.CreatedAt)
                                 .ToListAsync();
        }
    }
}
