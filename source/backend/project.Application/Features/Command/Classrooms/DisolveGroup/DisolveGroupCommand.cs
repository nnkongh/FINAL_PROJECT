using MediatR;
using project.Application.ModelsDto;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Classrooms.DisolveGroup
{
    public sealed record DisolveGroupCommand(int RequestedBy, int ClassRoomId, int GroupId) : IRequest<Result> { }
}
