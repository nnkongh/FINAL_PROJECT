using project.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;

namespace project.Domain.Models
{
    public class Classroom
    {
        public int Id { get; private set; }
        public string ClassName { get; private set; } = string.Empty;
        public string ClassCode { get; private set; } = string.Empty; // invite student
        public string SubjectName { get; private set; } = string.Empty;
        public int TeacherId { get; private set; }
        public UserApp? Teacher { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public MajorType MajorType { get; private set; }
        public int MaxMembersPerGroup { get; private set; }
        public bool IsActive { get; private set; }
        public ICollection<Groups> Groups => _groups.AsReadOnly();
        public ICollection<ClassEnrollment> Enrollments => _enrollments.AsReadOnly();

        private readonly List<Groups> _groups = new List<Groups>();
        private readonly List<ClassEnrollment> _enrollments = new();

        public static Classroom Create(string className, string subjectName, MajorType majorType, int maxMembersPerGroup, UserApp teacher)
        {
            if (string.IsNullOrWhiteSpace(className))
                throw new DomainException("Tên lớp không được để trống");
            if (string.IsNullOrWhiteSpace(subjectName))
                throw new DomainException("Tên môn học không được để trống");
            if (maxMembersPerGroup <= 0)
                throw new DomainException("Giới hạn thành viên mỗi nhóm phải lớn hơn 0");
            if (teacher.UserRole != UserRole.Teacher)
                throw new DomainException("Người tạo lớp phải là giáo viên");
            if (!teacher.IsActive)
                throw new DomainException("Tài khoản giáo viên đã bị khóa");
            if (majorType != MajorType.IT && majorType != MajorType.General)
                throw new DomainException("Chỉ nhận lớp IT hoặc lớp thường");

            return new Classroom
            {
                ClassName = className,
                SubjectName = subjectName,
                ClassCode = GenerateClassCode(),
                TeacherId = teacher.Id,
                MajorType = majorType,
                MaxMembersPerGroup = maxMembersPerGroup,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
        }
        public void AddTeacher(ClassEnrollment teacher)
        {
            _enrollments.Add(teacher);
        }
        public void UpdateClassroom(string className, string subjectName, int requestedBy)
        {
            if (string.IsNullOrWhiteSpace(className))
                throw new DomainException("Tên lớp không được để trống");

            if (string.IsNullOrWhiteSpace(subjectName))
                throw new DomainException("Tên môn học không được để trống");

            if (!IsActive)
                throw new DomainException("Lớp học đã bị vô hiệu hóa");

            if (requestedBy != TeacherId)
                throw new DomainException("Chỉ giáo viên của lớp mới có quyền thực hiện chức năng này");

            ClassName = className;
            SubjectName = subjectName;
        }

        public ClassEnrollment EnrollStudent(UserApp student, string classCode)
        {
            if (!IsActive)
                throw new DomainException("Lớp học đã bị vô hiệu hóa");
            if (classCode != ClassCode)
                throw new DomainException("Mã lớp không đúng");
            if (!student.IsActive)
                throw new DomainException("Tài khoản sinh viên đã bị khóa");
            if (student.UserRole != UserRole.Student)
                throw new DomainException("Chỉ sinh viên mới được tham gia lớp");

            var enrollment = FindEnrollment(student.Id);
            if (enrollment != null && enrollment.IsActive)
                throw new DomainException("Sinh viên đã tham gia lớp này rồi");
            if (enrollment != null && !enrollment.IsActive)
            {
                enrollment.ReEnroll(); // rejooin nếu đã từng rời lớp
                return enrollment;
            }
            enrollment = ClassEnrollment.Create(this, student);
            _enrollments.Add(enrollment);
            return enrollment;
        }

        public void RegenerateClassCode(int requestedBy)
        {
            if (!IsActive) 
                throw new DomainException("Lớp học đã bị vô hiệu hóa");
            if (requestedBy != TeacherId)
                throw new DomainException("Chỉ có giáo viên của lớp này mới có quyền thực hiện chức năng này");

            ClassCode = GenerateClassCode();
        }
        public void DissolveGroup(Classroom classroom, Groups group, int userId)
        {
            group.DeactivateGroup(classroom, userId);
        }

        public void Deactivate(int requestedBy)
        {
            if (!IsActive)
                throw new DomainException("Lớp học đã bị vô hiệu hóa rồi");

            if (requestedBy != TeacherId)
                throw new DomainException("Chỉ giáo viên của lớp mới có quyền thực hiện chức năng này");

            foreach (var group in _groups.Where(g => g.IsActive))
                group.DeactivateGroup();

            foreach (var enrollment in _enrollments.Where(e => e.IsActive))
                enrollment.Leave();

            IsActive = false;
        }
        public void Activate(Classroom classroom, int requestedBy)
        {
            if (classroom.IsActive) throw new DomainException("Lớp vẫn đang hoạt động");
            if (requestedBy != TeacherId) throw new DomainException("Chỉ giáo viên của lớp này mới có quyền thực hiện chức năng này");

            foreach (var group in _groups.Where(g => !g.IsActive))
                group.ReactiveGroup();

            foreach (var enrollment in _enrollments.Where(e => !e.IsActive))
                enrollment.ReEnroll();

            IsActive = true;
        }
        private static string GenerateClassCode()
            => Guid.NewGuid().ToString("N")[..8].ToUpper();

        public bool IsTeacher()
        {
            return _enrollments.Any(c => c.UserRole == UserRole.Teacher);
        }
        public ClassEnrollment? FindEnrollment(int userId)
        {
            return _enrollments.FirstOrDefault(e => e.UserId == userId && e.IsActive);
        }
        public bool HasStudent(int userId)
        {
            return _enrollments.Any(e => e.UserId == userId && e.UserRole == UserRole.Student && e.IsActive);
        }

        public int CountClassEnrollments()
        {
            return _enrollments.Count(e => e.IsActive && e.UserRole == UserRole.Student);
        }
        public int CountStudentsWithoutGroup()
        {
            return _enrollments.Count(e => e.IsActive && e.GroupId == null && e.UserRole == UserRole.Student);
        }
        public int CountGroups()
        {
            return _groups.Count(e => e.IsActive);
        }
        public void RemoveStudent(ClassEnrollment student)
        {
            _enrollments.Remove(student);
        }
    }
}
