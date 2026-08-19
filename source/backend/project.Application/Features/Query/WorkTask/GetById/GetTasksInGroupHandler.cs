using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Shared;

namespace project.Application.Features.Query.WorkTask.GetById
{
    public sealed class GetTasksInGroupHandler : IRequestHandler<GetTasksInGroupQuery, Result<IReadOnlyList<TaskModel>>>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public GetTasksInGroupHandler(IMapper mapper, IWorkTaskRepository taskRepository, IGroupRepository groupRepository, IUserRepository userRepository)
        {
            _mapper = mapper;
            _taskRepository = taskRepository;
            _groupRepository = groupRepository;
            _userRepository = userRepository;
        }

        public async Task<Result<IReadOnlyList<TaskModel>>> Handle(GetTasksInGroupQuery request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
            if (group == null) return Result.Failure<IReadOnlyList<TaskModel>>(new Error("404", "Nhóm không tồn tại"));
            if (!group.IsActive) return Result.Failure<IReadOnlyList<TaskModel>>(new Error("403", "Nhóm đã bị vô hiệu hóa"));

            var teacher = await _userRepository.GetByIdAsync(request.RequestedBy);
            if (teacher == null) return Result.Failure<IReadOnlyList<TaskModel>>(new Error("404", "Không tìm thấy người dùng"));

            if (teacher.Id != request.RequestedBy)
            {
                var member = group.FindMember(request.RequestedBy);
                if (member == null) return Result.Failure<IReadOnlyList<TaskModel>>(new Error("403", "Bạn không phải người trong nhóm"));
            }
            var tasks = await _taskRepository.GetTasksByGroupIdAsync(request.GroupId, request.taskStatus, request.taskPriority);
            var dto = _mapper.Map<IReadOnlyList<TaskModel>>(tasks);

            return Result.Success(dto);
        }
    }
}
