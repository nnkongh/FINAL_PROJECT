using project.Domain.Exceptions;

namespace project.Domain.Models
{
    public class ClassEnrollment
    {
        public int Id { get; private set; }
        public int ClassroomId { get; private set; }
        public int UserId { get; private set; }
        public int? GroupId { get; set; }
        public UserRole UserRole { get; private set; }
        public DateTime JoinedAt { get; private set; }
        public bool IsActive { get; private set; }
        public Classroom Classroom { get; private set; }
        public UserApp User { get; private set; }
        public Groups? Groups { get; private set; }
        private ClassEnrollment() { }

        public static ClassEnrollment Create(Classroom classroom, UserApp user)
        {
            return new ClassEnrollment
            {
                ClassroomId = classroom.Id,
                Classroom = classroom,
                UserId = user.Id,
                JoinedAt = DateTime.UtcNow,
                IsActive = true,
                UserRole = user.UserRole,
            };
        }

        public void Leave()
        {
            if (!IsActive) throw new DomainException("Sinh viên đã rời lớp rồi");
            IsActive = false;
        }
        public void ReEnroll()
        {
            if (IsActive) throw new DomainException("Sinh viên đã ở trong lớp rồi");
            IsActive = true;
            JoinedAt = DateTime.UtcNow;
        }
        public void SetGroup(int groupId)
        {
            GroupId = groupId;
        }
        public void UnsetGroup()
        {
            GroupId = null;
        }
    }
}
