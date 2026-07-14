using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace project.Domain.Interfaces
{
    public interface IUserRepository : IGenericRepository<UserApp>
    {
        Task<UserApp?> FindByEmailAsync(string email);
        Task<UserApp?> FindByUserCode(string userCode);
        Task<bool> IsEmailExistsAsync(string email);
        Task<string> GetRoleAsync(int id);
        Task AddRangeAsync(IEnumerable<UserApp> users);
        Task<List<UserApp>> SearchAsync(string keyword);
        Task<PagedResult<UserApp>> GetAllAsync(UserRole? userRole, int page, int pageSize);
        Task<UserApp?> GetByGithubIdAsync(long Id);
    }
}
