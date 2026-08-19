using project.Domain.Exceptions;

namespace project.Domain.Models
{
    public class Comment
    {
        public int Id { get; private set; }
        public int TaskId { get; private set; }
        public int UserId { get; private set; }
        public bool IsDeleted { get; private set; }
        public bool IsEdited { get; private set; }
        public int? ParentCommentId { get; private set; }
        public string Content { get; private set; } = string.Empty;
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; private set; } = DateTime.UtcNow;
        public WorkTask Task { get; private set; }
        public UserApp User { get; private set; }
        public Comment? ParentComment { get; private set; }

        private readonly List<Comment> _replies = new();
        public ICollection<Comment> Replies => _replies.AsReadOnly(); // ← nested replies

        private Comment() { }

        public static Comment Create(int taskId, int userId, string content, int? parentCommentId = null)
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new DomainException("Nội dung bình luận không được để trống");

            if (content.Length > 1000)
                throw new DomainException("Bình luận không được vượt quá 1000 ký tự");

            return new Comment
            {
                TaskId = taskId,
                UserId = userId,
                Content = content,
                ParentCommentId = parentCommentId,
                CreatedAt = DateTime.UtcNow,
                IsEdited = false,
                IsDeleted = false
            };
        }

        public void Edit(int requestUserId, string newContent)
        {
            if (IsDeleted) throw new DomainException("Không thể chỉnh sửa bình luận đã xóa");
            if (UserId != requestUserId) throw new DomainException("Bạn chỉ có thể chỉnh sửa bình luận của mình");
            if (string.IsNullOrWhiteSpace(newContent)) throw new DomainException("Nội dung không được để trống");

            Content = newContent;
            IsEdited = true;        
            UpdatedAt = DateTime.UtcNow;
        }

        public void Delete(int requestUserId)
        {
            if (IsDeleted) throw new DomainException("Bình luận đã bị xóa rồi");
            if (UserId != requestUserId) throw new DomainException("Bạn chỉ có thể xóa bình luận của mình");

            IsDeleted = true;      
            UpdatedAt = DateTime.UtcNow;
        }

        public bool IsReply() => ParentCommentId.HasValue;
    }
}
