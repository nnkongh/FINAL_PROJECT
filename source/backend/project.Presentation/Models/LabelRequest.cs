namespace project.Presentation.Models
{
    public class CreateLabelRequest
    {
        public int GroupId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty; 
    }

    public class UpdateLabelRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }
}
