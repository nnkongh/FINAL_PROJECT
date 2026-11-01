using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Classrooms.Update
{
    public sealed class UpdateClassHandler : IRequestHandler<UpdateClassCommand, Result<ClassroomUpdateModel>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IClassroomRepository _classroomRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public UpdateClassHandler(IClassroomRepository classroomRepository, IUserRepository userRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _classroomRepository = classroomRepository;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

       
        public async Task<Result<ClassroomUpdateModel>> Handle(UpdateClassCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var classRoom = await _classroomRepository.GetByIdAsync(request.ClassroomId);
                if (classRoom == null) return Result.Failure<ClassroomUpdateModel>(new Error("404", "Không tìm thấy lớp"));

                classRoom.UpdateClassroom(request.ClassName, request.SubjectName, request.RequestedBy);
                await _classroomRepository.Update(classRoom);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var dto = _mapper.Map<ClassroomUpdateModel>(classRoom);
                return Result.Success(dto);
            }
            catch(DomainException ex)
            {
                return Result.Failure<ClassroomUpdateModel>(new Error("400", $"{ex.Message}"));
            }
        }
    }
}
