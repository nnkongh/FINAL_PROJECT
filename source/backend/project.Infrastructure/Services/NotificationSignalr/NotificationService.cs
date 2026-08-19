using Microsoft.AspNetCore.SignalR;
using project.Application.Interfaces;
using project.Domain.Interfaces;
using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Services.NotificationSignalr
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationHubService _hubService;
        private readonly INotificationRepository _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;
        public NotificationService(INotificationHubService hubService, INotificationRepository notificationRepository, IUnitOfWork unitOfWork)
        {
            _hubService = hubService;
            _notificationRepository = notificationRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task SendNotificationAsync(Notification notification, CancellationToken cancellationToken = default)
        {
            await _notificationRepository.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _hubService.SendToUserAsync(notification.UserId, new
            {
                notification.Id,
                notification.Title,
                notification.Body,
                notification.CreatedAt,
                notification.IsRead,
                notification.GroupId,
                notification.RelatedEntityType,
                notification.RelatedEntityId,
            });
        }
    }
}
