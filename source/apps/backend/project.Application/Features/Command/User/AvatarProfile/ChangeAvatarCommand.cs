using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.User.AvatarProfile
{
    public sealed record ChangeAvatarCommand(int UserId, byte[] FileBytes, string FileName, string ContentType) : IRequest<Result<string>>
    {
    }
}
