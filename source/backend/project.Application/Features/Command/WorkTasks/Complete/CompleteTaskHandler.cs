using MediatR;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.WorkTasks.Complete
{
    public sealed class CompleteTaskHandler : IRequestHandler<CompleteTaskCommand, Result>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IEmailService _emailService;
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly ITaskHistoryRepository _taskHistory;
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;
        public CompleteTaskHandler(IWorkTaskRepository taskRepository, IUnitOfWork unitOfWork, IGroupRepository groupRepository, INotificationService notificationService, IEmailService emailService, IClassroomRepository classRoomRepository, ITaskHistoryRepository taskHistory)
        {
            _taskRepository = taskRepository;
            _unitOfWork = unitOfWork;
            _groupRepository = groupRepository;
            _notificationService = notificationService;
            _emailService = emailService;
            _classRoomRepository = classRoomRepository;
            _taskHistory = taskHistory;
        }

        public async Task<Result> Handle(CompleteTaskCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var task = await _taskRepository.GetWithCreatorAndAssigneeByIdAsync(request.TaskId);
                if (task == null) return Result.Failure(new Error("404", "Không tìm thấy task"));
                var oldStatus = task.Status;

                var group = await _groupRepository.GetByIdWithMemberAsync(task.GroupId);
                if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));
                if (!group.IsActive) return Result.Failure(new Error("403", "Nhóm đã bị khóa"));

                var classRoom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
                if (classRoom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp học"));
                if (!classRoom.IsActive) return Result.Failure(new Error("403", "Lớp học đã bị khóa"));

                var leader = group.FindMember(request.RequestedBy);

                if (leader == null || !leader.IsLeader()) return Result.Failure(new Error("403", "Chỉ có leader được phép hoàn thành công việc"));

                var member = group.FindMember(task.AssignedTo!.Value);
                if (member == null) return Result.Failure(new Error("404", "Không tìm thấy thành viên được giao"));

                member.AddContribution();
                task.Complete();

                //_unitOfWork.Repository<WorkTask>();
                //_unitOfWork.Repository<GroupMem>();
                //_unitOfWork.Repository<TaskHistory>();

                var history = TaskHistory.Create(task, request.RequestedBy, oldStatus, task.Status);
                await _taskHistory.AddAsync(history);
                await _taskRepository.Update(task);

                var emailSubject = $"Nhóm trưởng {leader.User.UserName}";
                var body = $@"
                            <h3>Thông báo Task</h3>
                            <p>Task <b>{task.Title}</b> đã được duyệt <b>Complete</b>.</p>
                            <ul>
                                <li>Nhóm: {group.Name}</li>
                                <li>Lớp: {classRoom.ClassName}</li>
                            </ul>";
                var to = task.Assignee!.Email;

                var message = new Message(to, emailSubject, body);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _emailService.SendEmail(message);
                var notification = Notification.Create(task.AssignedTo!.Value, task.Title, $"{task.Title} đã được duyệt trong nhóm {group.Name}'", task.GroupId, "Task", task.Id);
                await _notificationService.SendNotificationAsync(notification, cancellationToken);

                return Result.Success();
            }
            catch(DomainException ex)
            {
                return Result.Failure(new Error("400", $"{ex.Message}"));
            }
        }
    }
}
