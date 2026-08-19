using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Group.RemoveMem
{
    public sealed record RemoveMemberCommand(int groupId, int userId, int requestedBy) : IRequest<Result>
    {
    }
}
