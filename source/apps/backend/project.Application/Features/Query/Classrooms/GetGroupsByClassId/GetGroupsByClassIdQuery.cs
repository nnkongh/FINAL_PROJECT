using MediatR;
using project.Application.ModelsDto;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Classrooms.GetGroupsByClassId
{
    public sealed record GetGroupsByClassIdQuery(int RequestedBy, int ClassId) : IRequest<Result<IReadOnlyList<GroupSummaryModel>>>
    {
    }
}
