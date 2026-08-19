using MediatR;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Shared;

namespace project.Application.Features.Command.Classrooms.Activate
{
    public sealed class ActicateClassHandler : IRequestHandler<ActivateClassCommand, Result>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IClassroomRepository _classroomRepository;

        public ActicateClassHandler(IClassroomRepository classroomRepository, IUnitOfWork unitOfWork)
        {
            _classroomRepository = classroomRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(ActivateClassCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var classRoom = await _classroomRepository.GetByIdAsync(request.ClassId);
                if (classRoom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp"));
                
                classRoom.Activate(classRoom, request.RequestedBy);
                await _classroomRepository.Update(classRoom);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result.Success();
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error("400", ex.Message));
            }
        }
    }
}
