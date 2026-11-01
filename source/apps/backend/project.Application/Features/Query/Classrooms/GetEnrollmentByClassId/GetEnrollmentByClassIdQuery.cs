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

namespace project.Application.Features.Query.Classrooms.GetEnrollmentByClassId
{
    public sealed record GetEnrollmentByClassIdQuery(int RequestedBy, int ClassId) : IRequest<Result<ClassroomEnrollmentModel>>
    {
    }
    public sealed class GetEnrollmentByClassIdHandler : IRequestHandler<GetEnrollmentByClassIdQuery, Result<ClassroomEnrollmentModel>>
    {
        private readonly IMapper _mapper;
        private readonly IClassroomRepository _classRoomRepository;
        public GetEnrollmentByClassIdHandler(IMapper mapper, IClassroomRepository classRoomRepository)
        {
            _mapper = mapper;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result<ClassroomEnrollmentModel>> Handle(GetEnrollmentByClassIdQuery request, CancellationToken cancellationToken)
        {

            var classroom = await _classRoomRepository.GetClassroomWithEnrollmentsAsync(request.ClassId);
            if (classroom == null) return Result.Failure<ClassroomEnrollmentModel>(new Error("404", "Tài khoản này đã bị khóa"));

            var enrollment = classroom.FindEnrollment(request.RequestedBy);
            if (enrollment == null) return Result.Failure<ClassroomEnrollmentModel>(new Error("403", "Bạn không có quyền truy cập thông tin này"));
            if (!enrollment.IsActive) return Result.Failure<ClassroomEnrollmentModel>(new Error("403", "Bạn không có quyền truy cập thông tin này"));

            var dto = _mapper.Map<ClassroomEnrollmentModel>(classroom);
            return Result.Success(dto);
        }
    }
}
