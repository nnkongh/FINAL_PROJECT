using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Auth.Reset
{
    public sealed record ResetPasswordCommand(string email, string token, string newPassword, string passwordConfirm) : IRequest<Result>
    {
    }
}
