using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Classrooms.Create
{
    public sealed class CreateClassHandler : IRequestHandler<CreateClassCommand, Result<ClassRoomDetailModel>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IClassroomRepository _classroomRepository;
        private readonly IMapper _mapper;

        public CreateClassHandler(IClassroomRepository classroomRepository, IMapper mapper, IUnitOfWork unitOfWork, IUserRepository userRepository)
        {
            _classroomRepository = classroomRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _userRepository = userRepository;
        }

        public async Task<Result<ClassRoomDetailModel>> Handle(CreateClassCommand request, CancellationToken cancellationToken)
        {
            try
            {
                if (!Enum.TryParse<MajorType>(request.MajorType,ignoreCase:true, out var majorType))
                    return Result.Failure<ClassRoomDetailModel>(new Error("400", "Chỉ chấp nhận IT hoặc General"));

                var teacher = await _userRepository.GetByIdAsync(request.RequestedBy);
                if (teacher == null)
                    return Result.Failure<ClassRoomDetailModel>(new Error("400", "Không tìm thấy người dùng"));

                var classRoom = Classroom.Create(request.ClassName, request.SubjectName, majorType, request.LimitedUser, teacher);
                var classEnroll = ClassEnrollment.Create(classRoom, teacher);
                classRoom.AddTeacher(classEnroll);

                await _classroomRepository.AddAsync(classRoom);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var dto = _mapper.Map<ClassRoomDetailModel>(classRoom);

                return Result.Success(dto);
            }
            catch(DomainException ex)
            {
                return Result.Failure<ClassRoomDetailModel>(new Error("400", ex.Message));
            }
        }
    }
}
