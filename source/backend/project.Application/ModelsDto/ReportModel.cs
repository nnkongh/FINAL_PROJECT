using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.ModelsDto
{
    public class ReportModel
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public int GeneratedBy { get; set; }
        public string Title { get; set; }
        public string? FilePath { get; set; }
        public DateTime CreatedAt { get; set; }
        public ReportType Status { get; set; }
    }
    public class ExportGroups
    {
        public string ClassName { get; set; }
        public List<GroupReportModel> Reports { get; set; } = new();
        public List<FailedGroupModel> FailedGroups { get; set; } = new();

    }
    public class FailedGroupModel
    {
        public string GroupName { get; set; }
        public string Reason { get; set; }
    }
}
