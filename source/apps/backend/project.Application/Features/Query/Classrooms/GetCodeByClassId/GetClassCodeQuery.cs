using MediatR;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Classrooms.GetCodeByClassId
{
    public sealed record GetClassCodeQuery(int classId) : IRequest<Result<string>>
    {
    }
    public sealed class GetClassCodeQueryHandler : IRequestHandler<GetClassCodeQuery, Result<string>>
    {
        private readonly IClassroomRepository _classroomRepository;
        public GetClassCodeQueryHandler(IClassroomRepository classroomRepository)
        {
            _classroomRepository = classroomRepository;
        }
        public async Task<Result<string>> Handle(GetClassCodeQuery request, CancellationToken cancellationToken)
        {
            var classroom = await _classroomRepository.GetByIdAsync(request.classId);
            if (classroom == null) return Result.Failure<string>(new Error("404", "Không tìm thấy lớp học"));
            return Result.Success(classroom.ClassCode);
        }
    }
}
