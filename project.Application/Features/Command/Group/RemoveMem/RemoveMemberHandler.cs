using MediatR;
using project.Application.Interfaces;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Group.RemoveMem
{
    public sealed class RemoveMemberHandler : IRequestHandler<RemoveMemberCommand, Result>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly INotificationService _notificationService;
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUnitOfWork _unitOfWork;
        public RemoveMemberHandler(IGroupRepository groupRepository, IUnitOfWork unitOfWork, INotificationService notificationService, IWorkTaskRepository taskRepository, IClassroomRepository classRoomRepository)
        {
            _groupRepository = groupRepository;
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _taskRepository = taskRepository;
            _classRoomRepository = classRoomRepository;
        }
        public async Task<Result> Handle(RemoveMemberCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var group = await _groupRepository.GetByIdWithMemberAsync(request.groupId);
                if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));
                if (!group.IsActive) return Result.Failure(new Error("403", "Không thể thao tác trên nhóm bị vô hiệu hóa"));

                var leader = group.FindMember(request.requestedBy);
                if (leader == null || !leader.IsLeader()) return Result.Failure(new Error("403", "Chỉ có leader được quyền xóa thành viên"));

                var classRoom = await _classRoomRepository.GetClassroomWithEnrollmentsAsync(group.ClassRoomId);
                if (classRoom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp học"));
                if (!classRoom.IsActive) return Result.Failure(new Error("403", "Không thể thao tác trên lớp học bị vô hiệu hóa"));

                var enrollment = classRoom.FindEnrollment(request.requestedBy);

                var member = group.FindMember(request.userId);
                if (member == null) return Result.Failure(new Error("404", "Không tìm thấy thành viên cần xóa"));

                var tasks = await _taskRepository.GetTasksByUserIdAsync( request.userId, request.groupId);
                foreach (var task in tasks)
                {
                    task.UnAssigned();
                }

                if (enrollment != null)
                {
                    enrollment.UnsetGroup();
                }
                member.Leave();
                _unitOfWork.Repository<Groups>();
                _unitOfWork.Repository<WorkTask>();
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var notificaton = Notification.Create(member.UserId, $"Bạn đã bị {leader.User.UserName} mời ra khỏi nhóm {group.Name}", null, group.Id, "Group Member", member.Id);
                await _notificationService.SendNotificationAsync(notificaton, cancellationToken);

                return Result.Success();
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error("401", $"{ex.Message}"));
            }
        }
    }
}
