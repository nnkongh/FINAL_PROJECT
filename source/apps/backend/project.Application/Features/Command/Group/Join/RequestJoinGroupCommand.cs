using MediatR;
using project.Application.Interfaces;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Group.Join
{
    public sealed record RequestJoinGroupCommand(int requestedBy, int groupId) : IRequest<Result>
    {
    }
    public sealed class RequestJoinGroupCommandHandler : IRequestHandler<RequestJoinGroupCommand, Result>
    {
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly INotificationService _notificationService;
        public RequestJoinGroupCommandHandler(IClassroomRepository classRoomRepository, IGroupRepository groupRepository, INotificationService notificationService)
        {
            _classRoomRepository = classRoomRepository;
            _groupRepository = groupRepository;
            _notificationService = notificationService;
        }
        public async Task<Result> Handle(RequestJoinGroupCommand request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdWithMemberAsync(request.groupId);
            if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));
            if (!group.IsActive) return Result.Failure(new Error("403", "Nhóm đã bị khóa"));

            var classRoom = await _classRoomRepository.GetClassroomWithEnrollmentsAsync(group.ClassRoomId);
            if (classRoom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp học"));
            if (!classRoom.IsActive) return Result.Failure(new Error("403", "Lớp học đã bị khóa"));

            var enrollments = classRoom.FindEnrollment(request.requestedBy);
            if (enrollments == null) return Result.Failure(new Error("403", "Bạn không có quyền truy cập thông tin này"));
            if (!enrollments.IsActive) return Result.Failure(new Error("403", "Bạn không có quyền truy cập thông tin này"));

            var member = group.FindMember(request.requestedBy);
            if (member != null) return Result.Failure(new Error("403", "Bạn đã là thành viên của nhóm này"));

            var noti = Notification.Create(group.CreatedBy,"Yêu cầu tham gia nhóm", $"Người dùng {enrollments.User.UserName} với mã sinh viên {enrollments.User.UserCode} muốn tham gia nhóm {group.Name}",group.Id,"Group",group.Id);
            await _notificationService.SendNotificationAsync(noti,cancellationToken);
            return Result.Success();
        }
    }
}
