using MediatR;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Application.Features.Command.Group.Deactivate
{
    public sealed class DeactivateGroupHandler : IRequestHandler<DeactivateGroupCommand, Result>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeactivateGroupHandler(IGroupRepository groupRepository, IUnitOfWork unitOfWork, IClassroomRepository classRoomRepository)
        {
            _groupRepository = groupRepository;
            _unitOfWork = unitOfWork;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result> Handle(DeactivateGroupCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
                if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));
                if (!group.IsActive) return Result.Failure(new Error("400", "Nhóm đã bị vô hiệu hóa"));

                var classroom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
                if (classroom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp học"));
                if (!classroom.IsActive) return Result.Failure(new Error("400", "Lớp học đã bị vô hiệu hóa"));

                group.DeactivateGroup(classroom, request.UserId);
                _unitOfWork.Repository<Groups>();
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
