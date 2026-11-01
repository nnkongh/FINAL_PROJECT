using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using project.Infrastructure.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace project.Infrastructure.Repositories
{
    public class UserRepository : GenericRepository<UserApp>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task AddRangeAsync(IEnumerable<UserApp> users)
        {
            await _context.User.AddRangeAsync(users);
        }

        public async Task<UserApp?> FindByEmailAsync(string email)
        {
            return await _context.User.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<UserApp?> FindByUserCode(string userCode)
        {
            return await _context.User.FirstOrDefaultAsync(u => u.UserCode == userCode);
        }

        public async Task<PagedResult<UserApp>> GetAllAsync(UserRole? userRole, int page, int pageSize)
        {
            var query = _context.User.Where(u => userRole == null || u.UserRole == userRole);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(u => u.UserName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<UserApp>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
            };
        }

        public async Task<UserApp?> GetByGithubIdAsync(long Id)
        {
            return await _context.User.Where(u => u.GithubId == Id).FirstOrDefaultAsync();
        }

        public async Task<string> GetRoleAsync(int id)
        {
            var role = await _context.User
                .Where(u => u.Id == id)
                .Select(u => u.UserRole.ToString())
                .FirstOrDefaultAsync();
            return role ?? string.Empty;

        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _context.User.AnyAsync(u => u.Email == email);
        }

        public async Task<List<UserApp>> SearchAsync(string keyword)
        {
            //return await _context.User.Where(u => u.UserName.Contains(keyword) || u.Email.Contains(keyword) || u.UserCode!.Contains(keyword))
            //                          .Where(u => u.IsActive)
            //                          .Take(10)
            //                          .ToListAsync();

            return await _context.User.Where(u => EF.Functions.Contains(u.UserName, keyword)).Take(10).ToListAsync();
        }
    }
}
