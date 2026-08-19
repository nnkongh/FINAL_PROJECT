using project.Domain.Models;

namespace project.Domain.Interfaces
{
    public interface INotificationRepository : IGenericRepository<Notification>
    {
        Task<IReadOnlyList<Notification>> GetNotificationByUserId(int userId);
        Task<IReadOnlyList<Notification>> GetUnreadNotificationByUserId(int userId);
    }
}
