using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.WorkTask.GetTasksOverdue
{
    public sealed record GetTasksOverdueQuery(int RequestedBy, int GroupId) : IRequest<Result<IReadOnlyList<TaskOverDueModel>>>
    {
    }
    public sealed record GetTasksOverDueHandler : IRequestHandler<GetTasksOverdueQuery, Result<IReadOnlyList<TaskOverDueModel>>>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IMapper _mapper;
        public GetTasksOverDueHandler(IGroupRepository groupRepository, IWorkTaskRepository taskRepository, IMapper mapper, IClassroomRepository classRoomRepository)
        {
            _groupRepository = groupRepository;
            _taskRepository = taskRepository;
            _mapper = mapper;
            _classRoomRepository = classRoomRepository;
        }
        public async Task<Result<IReadOnlyList<TaskOverDueModel>>> Handle(GetTasksOverdueQuery request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
            if (group == null) return Result.Failure<IReadOnlyList<TaskOverDueModel>>(new Error("404", "Không tìm thấy nhóm"));

            var classRoom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
            if (classRoom == null) return Result.Failure<IReadOnlyList<TaskOverDueModel>>(new Error("404", "Không tìm thấy lớp"));

            if (classRoom.TeacherId != request.RequestedBy)
            {
                var member = group.FindMember(request.RequestedBy);
                if (member == null || !member.IsActive) return Result.Failure<IReadOnlyList<TaskOverDueModel>>(new Error("403", "Bạn không có quyền truy cập nhóm này"));
            }

            var tasks = await _taskRepository.GetOverdueTasksByGroupIdAsync(request.GroupId);
            var dto = _mapper.Map<IReadOnlyList<TaskOverDueModel>>(tasks);

            return Result.Success(dto);
        }
    }
}
