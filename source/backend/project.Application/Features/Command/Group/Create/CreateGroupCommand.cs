using MediatR;
using project.Application.ModelsDto;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Group.Create
{
    public sealed record CreateGroupCommand(string NameGroup, string SubjectName, int CreateBy, int LimitedUser, int ClassRoomId) : IRequest<Result<GroupModel>>
    {
    }
}
