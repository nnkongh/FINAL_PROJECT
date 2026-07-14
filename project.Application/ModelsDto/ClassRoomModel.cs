using project.Application.ModelsDto.DomainModelsDto;
using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.ModelsDto
{
    public class ClassRoomSumaryModel
    {
        public int Id { get; set; }
        public string ClassName { get; set; }
        public string SubjectName { get; set; }
        public bool IsActive { get; set; }
        public int TotalGroups { get; set; } 
        public int TotalEnrollments { get; set; }
        public int MaxMembersPerGroup { get; set; }
    }
    public class ClassRoomDetailModel
    {
        public int Id { get; set; }
        public string ClassName { get; set; }
        public string OwnerName { get; set; }
        public string SubjectName { get; set; }
        public int GroupCreated { get; set; }
        public int MembersWithoutGroup { get; set; }
        public string MajorType { get; set; }
        public int MaxMembersPerGroup { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int NumberEnrollments { get; set; }
    }
    public class ClassroomEnrollmentModel
    {
        public int Id { get; set; }
        public string ClassName { get; set; }
        public string Teacher { get; set; }
        public IReadOnlyList<EnrollmentModel> Enrollments { get; set; }
    }
    public class ClassroomGroupsModel
    {
        public IReadOnlyList<GroupModel> Groups { get; set; }
    }
    public class ClassroomUpdateModel
    {
        public string ClassName { get; set; }
        public string SubjectName { get; set; }
        public bool IsActive { get; set; }
    }
}
