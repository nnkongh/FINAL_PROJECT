using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.WorkTasks.Assign
{
    public sealed record AssignTaskCommand(int TaskId, int UserId, int RequestedBy) : IRequest<Result>
    {
    }
}
