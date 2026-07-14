using MediatR;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Shared;

namespace project.Application.Features.Command.Classrooms.ReGenerateInviteCode
{
    public sealed class GenerateInviteCodeHandler : IRequestHandler<ReGenerateInviteCodeCommand, Result<string>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IClassroomRepository _classroomRepository;
        private readonly IUnitOfWork _unitOfWork;


        public GenerateInviteCodeHandler(IUserRepository userRepository, IClassroomRepository classroomRepository, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _classroomRepository = classroomRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<string>> Handle(ReGenerateInviteCodeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var classRoom = await _classroomRepository.GetByIdAsync(request.ClassroomId);
                if (classRoom == null) return Result.Failure<string>(new Error("404", "Không tìm thấy lớp"));

                classRoom.RegenerateClassCode(request.RequestedBy);
                await _classroomRepository.Update(classRoom);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result.Success(classRoom.ClassCode);

            }
            catch (DomainException ex)
            {
                return Result.Failure<string>(new Error("400", ex.Message));
            }
        }
    }
}
