using MediatR;
using project.Application.Interfaces.CachedModel;
using project.Domain.Interfaces;
using project.Domain.Shared;

namespace project.Application.Features.Command.Classrooms.DisolveGroup
{
    public sealed class DisolveGroupHandler : IRequestHandler<DisolveGroupCommand, Result>
    {
        private readonly IUserRepository _userRepository;
        private readonly IGroupRepository _groupRepoistoryl;
        private readonly IClassroomRepository _classroomRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheInvalidator _cacheInvalidator;
        public DisolveGroupHandler(IClassroomRepository classroomRepository, IUserRepository userRepository, IUnitOfWork unitOfWork, IGroupRepository groupRepoistoryl, ICacheInvalidator cacheInvalidator)
        {
            _classroomRepository = classroomRepository;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _groupRepoistoryl = groupRepoistoryl;
            _cacheInvalidator = cacheInvalidator;
        }
        public async Task<Result> Handle(DisolveGroupCommand request, CancellationToken cancellationToken)
        {

            var group = await _groupRepoistoryl.GetByIdAsync(request.GroupId);
            if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));

            var classRoom = await _classroomRepository.GetByIdAsync(request.ClassRoomId);
            if (classRoom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp"));

            classRoom.DissolveGroup(classRoom, group, request.RequestedBy);
            await _classroomRepository.Update(classRoom);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _cacheInvalidator.InvalidateGroupAsync(group.Id, cancellationToken);

            return Result.Success();
        }
    }
}
