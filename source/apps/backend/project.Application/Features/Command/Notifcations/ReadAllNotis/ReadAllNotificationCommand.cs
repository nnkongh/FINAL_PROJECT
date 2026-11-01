using MediatR;
using project.Application.Interfaces;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Notifcations.ReadAllNotis
{
    public sealed record ReadAllNotificationCommand(int RequestedBy) : IRequest<Result>
    {
    }
    public sealed class ReadAllNotificationHandler : IRequestHandler<ReadAllNotificationCommand, Result>
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ReadAllNotificationHandler(IUnitOfWork unitOfWork, INotificationRepository notificationRepository)
        {
            _unitOfWork = unitOfWork;
            _notificationRepository = notificationRepository;
        }

        public async Task<Result> Handle(ReadAllNotificationCommand request, CancellationToken cancellationToken)
        {
            var notis = await _notificationRepository.GetUnreadNotificationByUserId(request.RequestedBy);

            foreach(var noti in notis)
            {
                noti.MarkAsRead();
            }

            _unitOfWork.Repository<Notification>();
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
            
        }
    }
}
