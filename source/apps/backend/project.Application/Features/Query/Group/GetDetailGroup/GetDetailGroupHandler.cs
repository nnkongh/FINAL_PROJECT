using AutoMapper;
using MediatR;
using project.Application.Interfaces.CachedModel;
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
        private readonly IGroupReadService _groupReadService;
        private readonly IMapper _mapper;
        public GetDetailGroupHandler(IGroupReadService groupReadService, IMapper mapper, IClassroomRepository classRoomRepository)
        {
            _groupReadService = groupReadService;
            _mapper = mapper;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result<GroupDetailModel>> Handle(GetDetailGroupQuery request, CancellationToken cancellationToken)
        {
            
            var groupCached = await _groupReadService.GetByIdWithDetailAsync(request.GroupId);
            if (groupCached == null) return Result.Failure<GroupDetailModel>(new Error("404", "Không tìm thấy nhóm"));

            var classroom = await _classRoomRepository.GetByIdAsync(groupCached.ClassroomId);
            if (classroom == null) return Result.Failure<GroupDetailModel>(new Error("404", "Không tìm thấy lớp học"));

            if (classroom.TeacherId != request.RequestedBy)
            {
                var status = await _groupReadService.GetMemberActiveStatusAsync(groupCached.Id, request.RequestedBy, cancellationToken);
                if (status == null) return Result.Failure<GroupDetailModel>(new Error("403", "Bạn không phải là thành viên của nhóm"));
                if (status == false) return Result.Failure<GroupDetailModel>(new Error("403", "Bạn đã rời nhóm"));
            }

            var dto = _mapper.Map<GroupDetailModel>(groupCached);
            return Result.Success(dto);
        }
    }
}
