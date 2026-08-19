using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Group.Delete
{
    public sealed record DeleteGroupCommand(int RequetedBy, int GroupId) : IRequest<Result>
    {
    }
}
