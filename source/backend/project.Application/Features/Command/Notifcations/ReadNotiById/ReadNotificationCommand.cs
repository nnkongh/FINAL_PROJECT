using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Notifcations.ReadNotiById
{
    public sealed record ReadNotificationCommand(int Id, int RequestedBy) : IRequest<Result>
    {
       
      
    }
}
