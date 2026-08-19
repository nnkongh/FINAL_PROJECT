using MediatR;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Group.AddMem
{
    public sealed record AddMemberCommand(int GroupId, int UserId, int RequestedBy, GroupMemberRole Role = GroupMemberRole.Member) : IRequest<Result>
    {
    }
}
