using MediatR;
using project.Application.ModelsDto;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Group.GetDetailGroup
{
    public sealed record GetDetailGroupQuery(int GroupId, int RequestedBy) : IRequest<Result<GroupDetailModel>>
    {
    }
}
