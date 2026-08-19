using MediatR;
using project.Application.ModelsDto.DomainModelsDto;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Profile
{
    public sealed record UserProfileQuery(int id) : IRequest<Result<UserProfileModel>>
    {
    }
}
