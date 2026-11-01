using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.ModelsDto.DomainModelsDto
{
    public class UserProfileModel
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; } = string.Empty;
        public string? UserCode { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public UserRole UserRole { get; set; }
        public string GithubUserName { get; set; }
    }
}
