using AutoMapper;
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

namespace project.Application.Features.Command.WorkTasks.Update
{
    public sealed class UpdateTaskHandler : IRequestHandler<UpdateTaskCommand, Result<TaskModel>>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly ITaskHistoryRepository _taskHistory;
        private readonly IGroupRepository _groupRepository;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;

        public UpdateTaskHandler(IWorkTaskRepository taskRepository, IUnitOfWork unitOfWork, IMapper mapper, IGroupRepository groupRepository, INotificationService notificationService, IClassroomRepository classRoomRepository, ITaskHistoryRepository taskHistory)
        {
            _taskRepository = taskRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _groupRepository = groupRepository;
            _notificationService = notificationService;
            _classRoomRepository = classRoomRepository;
            _taskHistory = taskHistory;
        }
        public async Task<Result<TaskModel>> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
        {

            try
            {
                if (request.DueDate.HasValue)
                {
                    if (request.DueDate.Value < DateTime.UtcNow) return Result.Failure<TaskModel>(new Error("404", "Ngày đến hạn phải là ngày trong tương lai"));
                }

                var task = await _taskRepository.GetByIdAsync(request.Id);
                if (task == null) return Result.Failure<TaskModel>(new Error("404", "Không tìm thấy task"));

                var group = await _groupRepository.GetByIdWithMemberAsync(task.GroupId);
                if (group == null) return Result.Failure<TaskModel>(new Error("404", "Không có thành viên nào"));
                if (!group.IsActive) return Result.Failure<TaskModel>(new Error("403", "Nhóm đã bị vô hiệu hóa"));

                var classroom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
                if (classroom == null) return Result.Failure<TaskModel>(new Error("404", "Không tìm thấy lớp học"));
                if (!classroom.IsActive) return Result.Failure<TaskModel>(new Error("403", "Lớp học đã bị vô hiệu hóa"));

                var member = group.FindMember(request.RequestedBy);
                if (member == null) return Result.Failure<TaskModel>(new Error("403", "Chỉ thành viên nhóm mới có thể cập nhật task"));
                if (!member.IsActive) return Result.Failure<TaskModel>(new Error("403", "Thành viên đã bị vô hiệu hóa"));

                if (request.AssignedTo.HasValue)
                {
                    var assignee = group.FindMember(request.AssignedTo.Value);
                    if (assignee == null) return Result.Failure<TaskModel>(new Error("404", "Người được giao không phải là thành viên của nhóm"));
                }
                task.UpdateDetails(request.Title, request.Description, request.Priority, request.TaskStatus,request.DueDate, request.AssignedTo);
                var taskHistory = TaskHistory.Create(task, request.RequestedBy);
                await _taskHistory.AddAsync(taskHistory);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                if (request.AssignedTo.HasValue && request.AssignedTo.Value != member.UserId)
                {
                    var notification = Notification.Create(request.AssignedTo.Value, $"Bạn đã được giao một task mới trong nhóm {group.Name} bởi {member.User.UserName}", $"Task: {task.Title}", group.Id, "Task", task.Id);
                    await _notificationService.SendNotificationAsync(notification,cancellationToken);
                }
                var dto = _mapper.Map<TaskModel>(task);

                return Result.Success(dto);
            }
            catch (DomainException ex)
            { 
                return Result.Failure<TaskModel>(new Error("401", $"{ex.Message}"));
            }
            
        }
    }
}
