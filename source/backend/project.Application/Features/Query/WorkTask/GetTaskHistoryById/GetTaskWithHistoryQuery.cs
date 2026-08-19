using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.WorkTask.GetTaskHistoryById
{
    public sealed record GetTaskWithHistoryQuery(int TaskId, int RequestedBy) : IRequest<Result<IReadOnlyList<TaskHistoryModel>>>
    {
    }
    public sealed class GetTaskWithHistoryHandler : IRequestHandler<GetTaskWithHistoryQuery, Result<IReadOnlyList<TaskHistoryModel>>>
    {
        private readonly IWorkTaskRepository _workTaskRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly ITaskHistoryRepository _taskHistoryRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IMapper _mapper;
        public GetTaskWithHistoryHandler(IWorkTaskRepository workTaskRepository, IMapper mapper, ITaskHistoryRepository taskHistoryRepository, IGroupRepository groupRepository, IClassroomRepository classRoomRepository)
        {
            _workTaskRepository = workTaskRepository;
            _mapper = mapper;
            _groupRepository = groupRepository;
            _taskHistoryRepository = taskHistoryRepository;
            _classRoomRepository = classRoomRepository;
        }
        public async Task<Result<IReadOnlyList<TaskHistoryModel>>> Handle(GetTaskWithHistoryQuery request, CancellationToken cancellationToken)
        {
            var task = await _workTaskRepository.GetByIdAsync(request.TaskId);
            if (task == null) return Result.Failure<IReadOnlyList<TaskHistoryModel>>(new Error("404", "Không tìm thấy task"));

            var group = await _groupRepository.GetByIdWithMemberAsync(task.GroupId);
            if (group == null) return Result.Failure<IReadOnlyList<TaskHistoryModel>>(new Error("404", "Không tìm thấy nhóm"));

            var classRoom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
            if (classRoom == null) return Result.Failure<IReadOnlyList<TaskHistoryModel>>(new Error("404", "Không tìm thấy lớp"));

            if (classRoom.TeacherId != request.RequestedBy)
            {
                var member = group.FindMember(request.RequestedBy);
                if (member == null) return Result.Failure<IReadOnlyList<TaskHistoryModel>>(new Error("403", "Bạn không có quyền truy cập task này"));
                if (!member.IsActive) return Result.Failure<IReadOnlyList<TaskHistoryModel>>(new Error("403", "Bạn đã bị vô hiệu hóa khỏi nhóm, không thể truy cập task này"));
            }

            var histories = await _taskHistoryRepository.GetByTaskIdAsync(task.Id);
            var dto = _mapper.Map<IReadOnlyList<TaskHistoryModel>>(histories);
            return Result.Success(dto);
        }
    }
}
