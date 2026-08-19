using MediatR;
using project.Application.ModelsDto;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Auth.Refresh
{
    public sealed record RefreshTokenCommand(string AccessToken, string RefreshToken) : IRequest<Result<TokenModel>>
    {
    }
}
