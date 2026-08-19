using MediatR;
using project.Application.Features.Query.Group.Github;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Group.GetUrlRepo
{
    public sealed record GetRepoGithubQuery(int RequestedBy, int GroupId) : IRequest<Result<string>>
    {
    }
    public sealed class GetRepoGithubHandler : IRequestHandler<GetRepoGithubQuery, Result<string>>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classRoomRepository;
        public GetRepoGithubHandler(IGroupRepository groupRepository, IClassroomRepository classRoomRepository)
        {
            _groupRepository = groupRepository;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result<string>> Handle(GetRepoGithubQuery request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
            if (group == null) return Result.Failure<string>(new Error("404", "Không tìm thấy nhóm"));
            if (!group.IsActive) return Result.Failure<string>(new Error("403", "Nhóm đã bị vô hiệu hóa"));

            var classRoom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
            if (classRoom == null) return Result.Failure<string>(new Error("404", "Không tìm thấy lớp học"));

            if (classRoom.TeacherId != request.RequestedBy)
            {
                var member = group.FindMember(request.RequestedBy);
                if (member == null) return Result.Failure<string>(new Error("403", "Bạn không phải là thành viên của nhóm"));
                if (!member.IsActive) return Result.Failure<string>(new Error("403", "Bạn đã rời nhóm"));
            }
            var repoUrl = group.GithubRepoUrl;
            if (repoUrl == null) return Result.Failure<string>(new Error("404", "Nhóm chưa liên kết với repo"));

            return Result.Success(repoUrl);
        }
    }
}
