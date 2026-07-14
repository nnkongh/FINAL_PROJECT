using MediatR;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Application.Features.Command.Group.Update
{
    public sealed class UpdateGroupHandler : IRequestHandler<UpdateGroupCommand, Result>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classroomRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateGroupHandler(IUnitOfWork unitOfWork, IGroupRepository groupRepository, IClassroomRepository classroomRepository)
        {
            _unitOfWork = unitOfWork;
            _groupRepository = groupRepository;
            _classroomRepository = classroomRepository;
        }

        public async Task<Result> Handle(UpdateGroupCommand request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
            if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));
            if (!group.IsActive) return Result.Failure(new Error("400", "Nhóm đã bị vô hiệu hóa"));

            var classroom = await _classroomRepository.GetByIdAsync(group.ClassRoomId);
            if (classroom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp học"));
            if (!classroom.IsActive) return Result.Failure(new Error("400", "Lớp học đã bị vô hiệu hóa"));

            var leader = group.FindMember(request.UserId);
            if (leader == null || !leader.IsLeader()) return Result.Failure(new Error("403", "Chỉ có leader được cập nhật nhóm"));

            group.UpdateDetails(request.Name, request.Subject);
            await _unitOfWork.Repository<Groups>().Update(group);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
