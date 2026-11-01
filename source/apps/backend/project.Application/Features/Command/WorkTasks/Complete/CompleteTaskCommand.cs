using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.WorkTasks.Complete
{
    public sealed record CompleteTaskCommand(int TaskId, int RequestedBy) : IRequest<Result>
    {
    }
}
