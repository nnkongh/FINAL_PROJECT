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

namespace project.Application.Features.Query.Group.GetClassById
{
    public sealed record GetClassByIdQuery(int RequestedBy, int ClassId) : IRequest<Result<ClassRoomDetailModel>>
    {
    }
    public sealed class GetClassByIdHandler : IRequestHandler<GetClassByIdQuery, Result<ClassRoomDetailModel>>
    {
        private readonly IClassroomRepository _classRepository;
        private readonly IMapper _mapper;

        public GetClassByIdHandler(IMapper mapper, IClassroomRepository classRepository)
        {
            _mapper = mapper;
            _classRepository = classRepository;
        }

        public async Task<Result<ClassRoomDetailModel>> Handle(GetClassByIdQuery request, CancellationToken cancellationToken)
        {

            var classRooms = await _classRepository.GetClassroomWithEnrollmentsAsync(request.ClassId);
            if (classRooms == null) return Result.Failure<ClassRoomDetailModel>(new Error("404", "Không tìm thấy nhóm"));

            var enrollent = classRooms.FindEnrollment(request.RequestedBy);
            if (enrollent == null) return Result.Failure<ClassRoomDetailModel>(new Error("403", "Bạn không có quyền truy cập nhóm này"));
            if (!enrollent.IsActive) return Result.Failure<ClassRoomDetailModel>(new Error("403", "Bạn đã bị vô hiệu hóa khỏi lớp này"));

            var dto = _mapper.Map<ClassRoomDetailModel>(classRooms);
            return Result.Success(dto);
        }
    }
}
                        