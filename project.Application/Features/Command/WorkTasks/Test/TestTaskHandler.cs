using MediatR;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Domain.Exceptions;
using project.Domain.Helpers;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Application.Features.Command.WorkTasks.Test
{
    public sealed record TestTaskHandler : IRequestHandler<TestTaskCommand, Result>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly INotificationService _notificationService;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly ITaskHistoryRepository _taskHistoryRepository;
        private readonly IEmailService _emailService;
        private readonly IGroupRepository _groupRepository;
        private readonly IUnitOfWork _unitOfWork;
        public TestTaskHandler(IWorkTaskRepository taskRepository, IUnitOfWork unitOfWork, INotificationService notificationService, IGroupRepository groupRepository, IEmailService emailService, IClassroomRepository classRoomRepository, ITaskHistoryRepository taskHistoryRepository)
        {
            _taskRepository = taskRepository;
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _groupRepository = groupRepository;
            _emailService = emailService;
            _classRoomRepository = classRoomRepository;
            _taskHistoryRepository = taskHistoryRepository;
        }

        public async Task<Result> Handle(TestTaskCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var task = await _taskRepository.GetWithCreatorAndAssigneeByIdAsync(request.TaskId);
                if (task == null) return Result.Failure(new Error("404", "Không tìm thấy task"));
                var oldStatus = task.Status;

                var group = await _groupRepository.GetByIdWithMemberAsync(task.GroupId);
                if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));
                if (!group.IsActive) return Result.Failure(new Error("400", "Nhóm đã bị vô hiệu hóa"));

                var classRoom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
                if (classRoom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp học"));
                if (!classRoom.IsActive) return Result.Failure(new Error("400", "Lớp học đã bị vô hiệu hóa"));

              

                var member = group.FindMember(request.RequestedBy);
                if (member == null) return Result.Failure(new Error("404", "Bạn không phải người dùng của nhóm"));
                if (!member.IsActive) return Result.Failure(new Error("400", "Bạn đã rời nhóm"));

                task.Test();

                var history = TaskHistory.Create(task, request.RequestedBy, oldStatus, task.Status);
                await _taskHistoryRepository.AddAsync(history);
                await _taskRepository.Update(task);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var emailSubject = $"Thành viên {member.User.UserName}";
                var body = $@"
                            <h3>Thông báo Task</h3>
                            <p>Task <b>{task.Title}</b> đã được gửi vào mục Test<b>Test</b>.</p>
                            <ul>
                                <li>Nhóm: {group.Name}</li>
                                <li>Lớp: {classRoom.ClassName}</li>
                            </ul>";
                var to = task.Creator.Email;

                var message = new Message(to, emailSubject, body);
                await _emailService.SendEmail(message);

                if (group.MajorType == MajorType.IT)
                {


                    var notification = Notification.Create(
                                                task.CreatedBy,
                                                $"{member.User.UserName} đã gửi task '{task.Title}' vào mục Test trong nhóm {group.Name}",
                                                $"Branch: feature/task-{task.Id}",
                                                task.GroupId,
                                                "Task",
                                                task.Id);
                    await _notificationService.SendNotificationAsync(notification, cancellationToken);

                }
                else
                {
                    var notification = Notification.Create(
                                                task.CreatedBy,
                                                $"{member.User.UserName} đã gửi task '{task.Title}' vào mục Test trong nhóm {group.Name}",
                                                null,
                                                task.GroupId,
                                                "Task",
                                                task.Id);
                    await _notificationService.SendNotificationAsync(notification, cancellationToken);
                } // GENERAL GROUP
                return Result.Success();

            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error("400", $"{ex.Message}"));
            }
        }
    }
}
