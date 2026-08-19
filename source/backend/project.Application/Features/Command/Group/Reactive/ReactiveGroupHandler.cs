using MediatR;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Application.Features.Command.Group.Reactive
{
    public sealed class ReactiveGroupHandler : IRequestHandler<ReactiveGroupCommand, Result>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classroomRepository;
        private readonly IUnitOfWork _unitOfWork;
        public ReactiveGroupHandler(IGroupRepository groupRepository, IUnitOfWork unitOfWork, IClassroomRepository classroomRepository)
        {
            _groupRepository = groupRepository;
            _unitOfWork = unitOfWork;
            _classroomRepository = classroomRepository;
        }
        public async Task<Result> Handle(ReactiveGroupCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
                if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));

                var classRoom = await _classroomRepository.GetClassroomWithEnrollmentsAsync(group.ClassRoomId);
                if (classRoom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp học"));

                if (request.UserId != classRoom.TeacherId)
                {
                    var leader = group.FindMember(request.UserId);
                    if (leader == null) return Result.Failure(new Error("403", "Bạn không phải là thành viên của nhóm"));
                    if (!leader.IsLeader()) return Result.Failure(new Error("403", "Bạn không phải là trưởng nhóm"));
                }

                group.ReactiveGroup(classRoom);
                _unitOfWork.Repository<Groups>();
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result.Success();
            }
            catch(DomainException ex)
            {
                return Result.Failure(new Error("400", ex.Message));
            }
        }
    }
}
