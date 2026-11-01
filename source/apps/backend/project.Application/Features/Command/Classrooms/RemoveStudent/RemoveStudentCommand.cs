using MediatR;
using project.Application.Interfaces;
using project.Application.Interfaces.CachedModel;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Classrooms.RemoveStudent
{
    public sealed record RemoveStudentCommand(int RequestedBy,  int StudentId, int ClassId) : IRequest<Result>
    {
    }
    internal sealed class RemoveStudentHandler : IRequestHandler<RemoveStudentCommand, Result>
    {
        private readonly IClassroomRepository _classRoomRepository;
        private readonly INotificationService _notificationService;
        private readonly IGroupRepository _groupRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheInvalidator _cacheInvalidator;

        public RemoveStudentHandler(IClassroomRepository classRoomRepository, IUnitOfWork unitOfWork, IGroupRepository groupRepository, INotificationService notificationService, ICacheInvalidator cacheInvalidator)
        {
            _classRoomRepository = classRoomRepository;
            _unitOfWork = unitOfWork;
            _groupRepository = groupRepository;
            _notificationService = notificationService;
            _cacheInvalidator = cacheInvalidator;
        }

        public async Task<Result> Handle(RemoveStudentCommand request, CancellationToken cancellationToken)
        {
            var classRoom = await _classRoomRepository.GetClassroomWithEnrollmentsAsync(request.ClassId);
            if (classRoom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp"));

            if (classRoom.TeacherId != request.RequestedBy) return Result.Failure(new Error("403", "Chỉ giáo viên của lớp được thực hiện chức năng này"));

            var student = classRoom.FindEnrollment(request.StudentId);
            if (student == null) return Result.Failure(new Error("404", "Không tìm thấy sinh viên"));

            var affectedGroupId = student.GroupId;
            var affectedTaskIds = new List<int>();

            if (student.GroupId.HasValue)
            {
                var group = await _groupRepository.GetByIdWithTaskMemberAsync(student.GroupId.Value);
                if (group != null)
                {

                    var member = group.FindMember(student.UserId);
                    if (member == null) return Result.Failure(new Error("404", "Không tìm thấy sinh viên này"));
                    group.RemoveMember(member);
                    foreach(var t in group.Tasks)
                    {
                        if(t.AssignedTo == student.UserId)
                        {
                            t.UnAssigned();
                            affectedTaskIds.Add(t.Id);
                        }
                    }
                    // Trường hợp khi còn sinh viên lâu nhất trong nhóm
                    var oldestMem = group.FindOldestMember();
                    if (oldestMem != null)
                    {
                        oldestMem.PromoteTo(GroupMemberRole.Leader);
                        await _unitOfWork.Repository<Groups>().Update(group);
                    }
                    // Trường hợp khi không còn sinh viên nào sẽ xóa luôn nhóm
                    else
                    {
                        await _unitOfWork.Repository<Groups>().Delete(group);
                    }
                }
            }
            classRoom.RemoveStudent(student);
            await _unitOfWork.Repository<Classroom>().Update(classRoom);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            if (affectedGroupId.HasValue)
            {
                await _cacheInvalidator.InvalidateGroupAsync(affectedGroupId.Value, cancellationToken);
            }
            foreach (var taskId in affectedTaskIds)
            {
                await _cacheInvalidator.InvalidateTaskAsync(taskId, cancellationToken);
            }

            var notificaton = Notification.Create(student.UserId, $"Bạn đã bị giáo viên mời ra khỏi lớp {classRoom.ClassName}", null, classRoom.Id,"Classroom", classRoom.Id);
            await _notificationService.SendNotificationAsync(notificaton, cancellationToken);

            return Result.Success();

        }
    }
}
