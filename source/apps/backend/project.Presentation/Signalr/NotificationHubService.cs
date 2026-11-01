using Microsoft.AspNetCore.SignalR;
using project.Application.Interfaces;

namespace project.Presentation.Signalr
{
    public class NotificationHubService : INotificationHubService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationHubService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToUserAsync(int userId, object message)
        {
            await _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", message);
        }
    }
}
