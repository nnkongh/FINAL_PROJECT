using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Group.Reactive
{
    public sealed record ReactiveGroupCommand(int GroupId, int UserId) : IRequest<Result>
    {
    }
}
