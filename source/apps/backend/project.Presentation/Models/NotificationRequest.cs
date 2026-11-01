namespace project.Presentation.Models
{
    public class MarkNotificationReadRequest
    {
        public List<int> NotificationIds { get; set; } = new(); // empty = mark all
    }
}
