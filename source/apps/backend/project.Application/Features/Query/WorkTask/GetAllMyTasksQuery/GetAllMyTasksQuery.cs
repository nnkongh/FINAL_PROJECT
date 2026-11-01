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

namespace project.Application.Features.Query.WorkTask.GetAllMyTasksQuery
{
    public sealed record GetAllMyTasksQuery(int UserId) : IRequest<Result<IReadOnlyList<TaskModel>>>
    {
    }
    internal sealed class GetAllMyTasksHandler : IRequestHandler<GetAllMyTasksQuery, Result<IReadOnlyList<TaskModel>>>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IMapper _mapper;
        public GetAllMyTasksHandler(IMapper mapper, IWorkTaskRepository taskRepository)
        {
            _mapper = mapper;
            _taskRepository = taskRepository;
        }

        public async Task<Result<IReadOnlyList<TaskModel>>> Handle(GetAllMyTasksQuery request, CancellationToken cancellationToken)
        {

            var tasks = await _taskRepository.GetTasksByUserIdAsync(request.UserId, null);

            var mapped = _mapper.Map<IReadOnlyList<TaskModel>>(tasks);

            return Result.Success(mapped);
        }
    }
}
