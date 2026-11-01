using project.Domain.Models;

namespace project.Presentation.Models
{
    public class CreateClassRequest
    {
        public string ClassName { get; set; }
        public string SubjectName { get; set; }
        public string MajorType { get; set; }
        public int MaxMembersPerGroup { get; set; }

    }
    public class UpdateClassRequest
    {
        public string ClassName { get; set; }
        public string SubjectName { get; set; }
    }
    public class EnrollStudentRequest
    {
        public int StudentId { get; set; }
        public string ClassCode { get; set; } = string.Empty;
        public int ClassroomId { get; set; }
    }
    public class JoinClassRequest
    {
        public string ClassCode { get; set; } = string.Empty;
    }
    /*
     request.ClassName, request.SubjectName,
 request.MajorType, request.MaxMembersPerGroup, userId.Value
     */
    public class RemoveStudentRequest
    {
        public int StudentId { get; set; }
    }
}
