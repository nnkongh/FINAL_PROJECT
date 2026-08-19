using MediatR;
using project.Application.ModelsDto;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace project.Application.Features.Command.WorkTasks.Create
{
    public sealed record CreateTaskCommand(int GroupId, string Title, int CreatedBy, TasksStatus TaskStatus, TaskPriority Priority, int RequestedBy, int? AssignedTo = null, DateTime? DueDate = null, string? Description = null) : IRequest<Result<TaskModel>>
    {
    }
}
