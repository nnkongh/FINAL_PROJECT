using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Group.GetDetailGroup
{
    public sealed class GetDetailGroupHandler : IRequestHandler<GetDetailGroupQuery, Result<GroupDetailModel>>
    {
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IMapper _mapper;
        public GetDetailGroupHandler(IGroupRepository groupRepository, IMapper mapper, IClassroomRepository classRoomRepository)
        {
            _groupRepository = groupRepository;
            _mapper = mapper;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result<GroupDetailModel>> Handle(GetDetailGroupQuery request, CancellationToken cancellationToken)
        {
            
            var group = await _groupRepository.GetByIdWithDetailAsync(request.GroupId);
            if (group == null) return Result.Failure<GroupDetailModel>(new Error("404", "Không tìm thấy nhóm"));

            var classroom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
            if (classroom == null) return Result.Failure<GroupDetailModel>(new Error("404", "Không tìm thấy lớp học"));

            if (classroom.TeacherId != request.RequestedBy)
            {
                var member = group.FindMember(request.RequestedBy);
                if (member == null) return Result.Failure<GroupDetailModel>(new Error("403", "Bạn không phải là thành viên của nhóm"));
                if (!member.IsActive) return Result.Failure<GroupDetailModel>(new Error("403", "Bạn đã rời nhóm"));
            }

            var dto = _mapper.Map<GroupDetailModel>(group);
            return Result.Success(dto);
        }
    }
}
