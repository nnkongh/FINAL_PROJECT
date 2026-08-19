using MediatR;
using Microsoft.Extensions.Logging;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.WorkTasks.Assign
{
    public sealed class AssignTaskHandler : IRequestHandler<AssignTaskCommand, Result>
    {
        private readonly IWorkTaskRepository _workTaskRepository;
        private readonly INotificationService _notificationService;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AssignTaskHandler(IUnitOfWork unitOfWork, IWorkTaskRepository workTaskRepository, IGroupRepository groupRepository, INotificationService notificationService, IClassroomRepository classRoomRepository)
        {
            _unitOfWork = unitOfWork;
            _workTaskRepository = workTaskRepository;
            _groupRepository = groupRepository;
            _notificationService = notificationService;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result> Handle(AssignTaskCommand request, CancellationToken cancellationToken)
        {

            try
            {
                var task = await _workTaskRepository.GetByIdAsync(request.TaskId);
                if (task == null) return Result.Failure(new Error("404", "Không tìm thấy task"));   

                var group = await _groupRepository.GetByIdWithMemberAsync(task.GroupId);
                if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));
                if (!group.IsActive) return Result.Failure(new Error("403", "Nhóm đã bị khóa"));

                var classroom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
                if (classroom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp học"));
                if (!classroom.IsActive) return Result.Failure(new Error("403", "Lớp học đã bị vô hiệu hóa"));

                var leader = group.FindMember(request.RequestedBy);
                if (leader == null || !leader.IsLeader()) return Result.Failure(new Error("403", "Chỉ có leader được giao task"));

                var member = group?.FindMember(request.UserId);
                if (member == null) return Result.Failure(new Error("404", "Người dùng không phải là thành viên trong nhóm"));

                task.Assign(request.UserId);
                _unitOfWork.Repository<WorkTask>();
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                
                if (request.UserId != leader.UserId) 
                {
                    var notification = Notification.Create(request.UserId, $"Bạn được giao task: {task.Title} bởi {leader.User.UserName} trong nhóm {group!.Name}", null, task.GroupId, "Task", task.Id);
                    await _notificationService.SendNotificationAsync(notification, cancellationToken);

                }
                return Result.Success();
            }
            catch(DomainException ex)
            {
                return Result.Failure(new Error("401", $"{ex.Message}"));
            }
        }
    }
}
