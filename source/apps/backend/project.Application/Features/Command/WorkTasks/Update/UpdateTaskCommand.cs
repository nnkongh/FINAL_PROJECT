using MediatR;
using project.Application.ModelsDto;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace project.Application.Features.Command.WorkTasks.Update
{
    public sealed record UpdateTaskCommand(int Id, string Title, string? Description, TaskPriority Priority, TasksStatus TaskStatus, int RequestedBy, DateTime? DueDate = null, int? AssignedTo = null) : IRequest<Result<TaskModel>>
    {
    }
}
