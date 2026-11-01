using AutoMapper;
using MediatR;
using project.Application.Features.Query.Group.Github;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Group.GetById
{
    public sealed record GetGroupByIdQuery(int RequestedBy, int GroupId) : IRequest<Result<GroupModel>>
    {
    }
    public sealed class GetGroupByIdHandler : IRequestHandler<GetGroupByIdQuery, Result<GroupModel>>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IMapper _mapper;
        public GetGroupByIdHandler(IGroupRepository groupRepository, IMapper mapper, IClassroomRepository classRoomRepository)
        {
            _groupRepository = groupRepository;
            _mapper = mapper;
            _classRoomRepository = classRoomRepository;
        }
        public async Task<Result<GroupModel>> Handle(GetGroupByIdQuery request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
            if (group == null) return Result.Failure<GroupModel>(new Error("404", "Không tìm thấy nhóm"));

            var classRoom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
            if (classRoom == null) return Result.Failure<GroupModel>(new Error("404", "Không tìm thấy lớp học"));

            if (classRoom.TeacherId != request.RequestedBy)
            {
                var member = group.FindMember(request.RequestedBy);
                if (member == null) return Result.Failure<GroupModel>(new Error("403", "Bạn không phải là thành viên của nhóm"));
                if (!member.IsActive) return Result.Failure<GroupModel>(new Error("403", "Bạn đã rời nhóm"));
            }
            var dto = _mapper.Map<GroupModel>(group);
            return Result.Success(dto);
        }
    }
}
