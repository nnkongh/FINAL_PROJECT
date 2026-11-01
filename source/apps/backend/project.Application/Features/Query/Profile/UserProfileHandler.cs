using MediatR;
using project.Application.ModelsDto.DomainModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Profile
{
    public class UserProfileHandler : IRequestHandler<UserProfileQuery, Result<UserProfileModel>>
    {
        private readonly IUserRepository _userRepository;

        public UserProfileHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<Result<UserProfileModel>> Handle(UserProfileQuery request, CancellationToken cancellationToken)
        {

            var user = await _userRepository.GetByIdAsync(request.id);
            if (user == null) return Result.Failure<UserProfileModel>(new Error("404", "Không tìm thấy người dùng"));

            var profileModel = new UserProfileModel { Id = user.Id, Email = user.Email, GithubUserName = user.GithubUserName, UserCode = user.UserCode, AvatarUrl = user.AvatarUrl, IsActive = true, UserRole = user.UserRole, UserName = user.UserName };
            return Result.Success(profileModel);
        }
    }
}
