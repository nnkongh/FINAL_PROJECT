using MediatR;
using project.Application.ModelsDto;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace project.Application.Features.Query.WorkTask.GetTasks
{
    public sealed record GetTasksByUserIdQuery(int groupId, int? LabelId, int RequestedBy, TasksStatus? Status = null, TaskPriority? TaskPriority = null) : IRequest<Result<IReadOnlyList<TaskModel>>>
    {
    }
}
