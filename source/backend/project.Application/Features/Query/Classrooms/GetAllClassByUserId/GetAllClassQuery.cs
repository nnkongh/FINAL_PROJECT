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

namespace project.Application.Features.Query.Classrooms.GetAllClass
{
    public sealed record GetAllClassQuery(int RequestedBy) : IRequest<Result<IReadOnlyList<ClassRoomSumaryModel>>>
    {
    }
    public sealed class GetAllClassHandler : IRequestHandler<GetAllClassQuery, Result<IReadOnlyList<ClassRoomSumaryModel>>>
    {
        private readonly IClassroomRepository _classRepository;
        private readonly IMapper _mapper;

        public GetAllClassHandler(IMapper mapper, IClassroomRepository classRepository)
        {
            _mapper = mapper;
            _classRepository = classRepository;
        }

        public async Task<Result<IReadOnlyList<ClassRoomSumaryModel>>> Handle(GetAllClassQuery request, CancellationToken cancellationToken)
        {
            var classRooms = await _classRepository.GetAllClassByUserIdAsync(request.RequestedBy);
            if (classRooms == null) return Result.Failure<IReadOnlyList<ClassRoomSumaryModel>>(new Error("404", "Không tìm thấy nhóm"));

            var dto = _mapper.Map<IReadOnlyList<ClassRoomSumaryModel>>(classRooms);
            return Result.Success(dto);
        }
    }
}
