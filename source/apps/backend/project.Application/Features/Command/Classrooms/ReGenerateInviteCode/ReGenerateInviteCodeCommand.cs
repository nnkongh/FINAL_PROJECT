using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Classrooms.ReGenerateInviteCode
{
    public sealed record ReGenerateInviteCodeCommand(int RequestedBy, int ClassroomId) : IRequest<Result<string>>
    {
    }
}
