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
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Group.GetMemberGroup
{
    public sealed class GetMembersHandler : IRequestHandler<GetMembersQuery, Result<IReadOnlyList<GroupMemModel>>>
    {
        private readonly IMapper _mapper;
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classRoomRepository;
        public GetMembersHandler(IMapper mapper, IGroupRepository groupRepository, IClassroomRepository classRoomRepository)
        {
            _mapper = mapper;
            _groupRepository = groupRepository;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result<IReadOnlyList<GroupMemModel>>> Handle(GetMembersQuery request, CancellationToken cancellationToken)
        {

            var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
            if (group == null) return Result.Failure<IReadOnlyList<GroupMemModel>>(new Error("404", "Không tìm thấy nhóm"));

            var classRoom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
            if (classRoom == null) return Result.Failure<IReadOnlyList<GroupMemModel>>(new Error("404", "Không tìm thấy lớp học"));

            if (classRoom.TeacherId != request.RequestedBy)
            {
                var member = group.FindMember(request.RequestedBy);
                if (member == null) return Result.Failure<IReadOnlyList<GroupMemModel>>(new Error("403", "Bạn không phải là thành viên của nhóm"));
                if (!member.IsActive) return Result.Failure<IReadOnlyList<GroupMemModel>>(new Error("403", "Bạn đã rời nhóm"));
            }
            var members = group.Members.ToList();
            var dto = _mapper.Map<IReadOnlyList<GroupMemModel>>(members);

            return Result.Success(dto);
        }
    }
}
