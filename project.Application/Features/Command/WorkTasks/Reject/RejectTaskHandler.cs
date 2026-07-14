using MediatR;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Application.Features.Command.WorkTasks.Reject
{
    public sealed class RejectTaskHandler : IRequestHandler<RejectTaskCommand, Result>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly ITaskHistoryRepository _taskHistory;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RejectTaskHandler(IUnitOfWork unitOfWork, INotificationService notificationService, IWorkTaskRepository taskRepository, IGroupRepository groupRepository, IClassroomRepository classRoomRepository, ITaskHistoryRepository taskHistory, IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _taskRepository = taskRepository;
            _groupRepository = groupRepository;
            _classRoomRepository = classRoomRepository;
            _taskHistory = taskHistory;
            _emailService = emailService;
        }

        public async Task<Result> Handle(RejectTaskCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var task = await _taskRepository.GetByIdAsync(request.TaskId);
                if (task == null) return Result.Failure(new Error("404", "Không tìm thấy task"));
                var oldStatus = task.Status;

                var group = await _groupRepository.GetByIdWithMemberAsync(task.GroupId);
                if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));
                if (!group.IsActive) return Result.Failure(new Error("400", "Nhóm đã bị khóa"));

                var classroom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
                if (classroom == null) return Result.Failure<TaskModel>(new Error("404", "Không tìm thấy lớp học"));
                if (!classroom.IsActive) return Result.Failure<TaskModel>(new Error("403", "Lớp học đã bị vô hiệu hóa"));

                var leader = group.FindMember(request.RequestedBy);
                if (leader == null || !leader.IsLeader()) return Result.Failure(new Error("403", "Bạn không phải leader để từ chối task này"));

                task.Reject();
                var history = TaskHistory.Create(task, request.RequestedBy, oldStatus, task.Status);

                await _taskHistory.AddAsync(history);
                await _taskRepository.Update(task);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var emailSubject = $"Nhóm trưởng {leader.User.UserName}";
                var body = $@"
                            <h3>Thông báo Task</h3>
                            <p>Task <b>{task.Title}</b> đã bị từ chối.<b>Complete</b>.</p>
                            <ul>
                                <li>Nhóm: {group.Name}</li>
                                <li>Lớp: {classroom.ClassName}</li>
                            </ul>";
                var to = task.Assignee!.Email;

                var message = new Message(to, emailSubject, body);
                await _emailService.SendEmail(message);

                var notification = Notification.Create(task.AssignedTo!.Value, task.Title, $"{task.Title} đã bị từ chối", task.GroupId, "Task", task.Id);
                await _notificationService.SendNotificationAsync(notification, cancellationToken);
                return Result.Success();
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error("400", ex.Message));
            }
        }
    }
}
