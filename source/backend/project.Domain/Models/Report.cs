namespace project.Domain.Models
{
    public class Report
    {
        // Class xử lý xuất báo cáo
        public int Id { get; private set; }
        public int GroupId { get; private set; }
        public int GeneratedBy { get; private set; }
        public string Title { get; private set; }
        public string? FilePath { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public ReportType Status { get; private set; }
        public Groups Group { get; private set; }
        public UserApp User { get; private set; }

        private Report() { }

        public static Report Create(int groupId, int generatedBy, string title)
        {
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Tiêu đề không thể trống");

            return new Report
            {
                GroupId = groupId,
                GeneratedBy = generatedBy,
                Title = title,
                CreatedAt = DateTime.UtcNow,
            };
        }
        public void StartGenerating()
        {
            if (Status != ReportType.Draft)
            {
                throw new InvalidOperationException("Bản báo cáo bị lỗi khi đang tạo");
            }
            Status = ReportType.Generating;
        }

        public void CompleteReport(string filePath)
        {
            if (Status != ReportType.Generating) throw new InvalidOperationException("Bản báo cáo bị lỗi khi đang tạo");

            if (string.IsNullOrWhiteSpace(filePath)) throw new ArgumentException("Đường dẫn tệp không thể trống");

            FilePath = filePath;
            Status = ReportType.Completed;
        }
        public void FailReport()
        {
            if (Status != ReportType.Generating) throw new InvalidOperationException("Bản báo cáo bị lỗi khi đang tạo");

            Status = ReportType.Failed;
        }
    }
}
