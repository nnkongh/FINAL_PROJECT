using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Group.Update
{
    public sealed record UpdateGroupCommand(int UserId, int GroupId, string Name, string Subject) : IRequest<Result>
    {
    }
}
