using project.Domain.Exceptions;

namespace project.Domain.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public string? Body { get; set; }
        public bool IsRead { get; set; } = false;
        public int? GroupId { get; set; }
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public UserApp User { get; set; }


        private Notification() { }

        public static Notification Create(int userId, string title, string? body = null,
            int? groupId = null, string? relatedEntityType = null, int? relatedEntityId = null)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new DomainException("Nội dung thông báo không được để trống");

            return new Notification
            {
                UserId = userId,
                Title = title,
                Body = body,
                GroupId = groupId,
                RelatedEntityType = relatedEntityType,
                RelatedEntityId = relatedEntityId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
        }

        public void MarkAsRead()
        {
            if (IsRead) return; 
            IsRead = true;
        }
    }
}
