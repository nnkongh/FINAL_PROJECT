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

namespace project.Application.Features.Command.WorkTasks.Start
{
    public sealed record StartTaskHandler : IRequestHandler<StartTaskCommand, Result>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly ITaskHistoryRepository _taskHisotryRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUnitOfWork _unitOfWork;
        public StartTaskHandler(IWorkTaskRepository taskRepository, IUnitOfWork unitOfWork, IGroupRepository groupRepository, IClassroomRepository classRoomRepository, ITaskHistoryRepository taskHisotryRepository)
        {
            _taskRepository = taskRepository;
            _unitOfWork = unitOfWork;
            _groupRepository = groupRepository;
            _classRoomRepository = classRoomRepository;
            _taskHisotryRepository = taskHisotryRepository;
        }

        public async Task<Result> Handle(StartTaskCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var task = await _taskRepository.GetByIdAsync(request.Id);
                if (task == null) return Result.Failure(new Error("404", "Không tìm thấy task"));
                var oldStatus = task.Status;

                var group = await _groupRepository.GetByIdWithMemberAsync(task.GroupId);
                if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm của task này"));
                if (!group.IsActive) return Result.Failure(new Error("403", "Nhóm đã bị vô hiệu hóa, không thể bắt đầu task"));

                var classroom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
                if (classroom == null) return Result.Failure<TaskModel>(new Error("404", "Không tìm thấy lớp học"));
                if (!classroom.IsActive) return Result.Failure<TaskModel>(new Error("403", "Lớp học đã bị vô hiệu hóa"));

                var member = group.FindMember(request.RequestedBy);
                if (member == null) return Result.Failure(new Error("403", "Chỉ thành viên nhóm mới có thể bắt đầu task"));
                if (!member.IsActive) return Result.Failure(new Error("403", "Thành viên đã bị vô hiệu hóa, không thể bắt đầu task"));

                if (task.AssignedTo == null) return Result.Failure(new Error("403", "Chỉ có thể bắt đầu khi đã có người nhận task này"));
                
                task.Start();

                var history = TaskHistory.Create(task, request.RequestedBy, oldStatus, task.Status);
                await _taskHisotryRepository.AddAsync(history);
                await _taskRepository.Update(task);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result.Success();
            }
            catch(DomainException ex)
            {
                return Result.Failure(new Error("400", $"{ex.Message}"));
            }
        }
    }
}
