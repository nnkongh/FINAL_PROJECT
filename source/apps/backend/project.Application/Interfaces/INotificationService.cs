using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Interfaces
{
    public interface INotificationService
    {
        Task SendNotificationAsync(Notification message,  CancellationToken cancellationToken);
    }
    public interface INotificationHubService
    {
        Task SendToUserAsync(int userId, object message);
    }
}
