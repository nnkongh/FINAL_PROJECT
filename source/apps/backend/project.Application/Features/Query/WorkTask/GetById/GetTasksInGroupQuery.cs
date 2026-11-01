using MediatR;
using project.Application.ModelsDto;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace project.Application.Features.Query.WorkTask.GetById
{
    public sealed record GetTasksInGroupQuery(int GroupId, int RequestedBy, int? LabelId = null, TasksStatus? taskStatus = null, TaskPriority? taskPriority = null) : IRequest<Result<IReadOnlyList<TaskModel>>>
    {
    }
}
