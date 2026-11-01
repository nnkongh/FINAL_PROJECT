namespace project.Presentation.Models
{
    public class CreateCommentRequest
    {
        public string Content { get; set; } = string.Empty;
        public int? ParentCommentId { get; set; } // null = top-level comment, set = reply
    }

    public class UpdateCommentRequest
    {
        public string Content { get; set; } = string.Empty;
    }
}
