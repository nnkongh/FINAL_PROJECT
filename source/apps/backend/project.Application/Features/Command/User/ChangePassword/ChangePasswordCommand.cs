using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.User.ChangePassword
{
    public sealed record ChangePasswordCommand(int UserId, string OldPassword, string NewPassword, string ConfirmPassword) : IRequest<Result>
    {
    }
}
