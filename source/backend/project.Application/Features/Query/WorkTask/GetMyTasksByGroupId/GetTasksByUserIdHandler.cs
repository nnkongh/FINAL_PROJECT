using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.WorkTask.GetTasks
{
    public sealed class GetTasksByUserIdHandler : IRequestHandler<GetTasksByUserIdQuery,Result<IReadOnlyList<TaskModel>>>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IMapper _mapper;
        public GetTasksByUserIdHandler(IWorkTaskRepository taskRepository, IMapper mapper, IGroupRepository groupRepository)
        {
            _taskRepository = taskRepository;
            _mapper = mapper;
            _groupRepository = groupRepository;
        }

        public async Task<Result<IReadOnlyList<TaskModel>>> Handle(GetTasksByUserIdQuery request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdWithMemberAsync(request.groupId);
            if (group == null) return Result.Failure<IReadOnlyList<TaskModel>>(new Error("404", "Không tìm thấy nhóm"));

            var member = group.FindMember(request.RequestedBy);
            if (member == null) return Result.Failure<IReadOnlyList<TaskModel>>(new Error("403", "Bạn không phải là người trong nhóm"));
            if (!member.IsActive) return Result.Failure<IReadOnlyList<TaskModel>>(new Error("403", "Tài khoản của bạn đã bị vô hiệu hóa trong nhóm"));

            var tasks = await _taskRepository.GetTasksByUserIdAsync(request.groupId,request.RequestedBy, request.Status, request.TaskPriority);

            var mapped = _mapper.Map<IReadOnlyList<TaskModel>>(tasks);

            return Result.Success(mapped);
        }
    }
}
