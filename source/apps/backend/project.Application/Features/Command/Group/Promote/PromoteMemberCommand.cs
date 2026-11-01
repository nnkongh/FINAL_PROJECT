using MediatR;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Group.Promote
{
    public sealed record PromoteMemberCommand(int GroupId, int UserId, GroupMemberRole Role, int RequestedBy) : IRequest<Result>
    {
    }
}
