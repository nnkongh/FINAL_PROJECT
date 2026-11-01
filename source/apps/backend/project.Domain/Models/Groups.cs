using project.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Domain.Models
{
    public enum GroupMemberRole { Leader, Member }
    public enum TasksStatus { ToDo, InProgress, Done, Cancelled, Test}
    public enum UserRole { Student, Teacher, Admin }
    public enum TaskPriority { Low, Medium, High }
    public enum ActionType { CreateTask, UpdateTask, CompleteTask, Comment, JoinGroup }
    public enum ReportType { Draft, Generating, Completed, Failed }
    public enum MajorType { IT, General }

    public class Groups
    {
        public int Id { get; private set; }
        public int ClassRoomId { get; private set; }
        public Classroom? Classroom { get; private set; }
        public int? EnrollmentId { get;private set; }
        public ClassEnrollment ClassEnrollment { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string SubjectOrProjectName { get; private set; } = string.Empty;
        public int CreatedBy { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public int LimitedUser { get; private set; }
        public bool IsActive { get; private set; }
        public MajorType MajorType { get; private set; }
        public UserApp Creator { get; private set; }
        public ICollection<GroupMem> Members => _members.AsReadOnly();
        public ICollection<WorkTask> Tasks => _tasks.AsReadOnly();
        public ICollection<Report> Reports => _reports.AsReadOnly();

        private readonly List<GroupMem> _members = new();
        private readonly List<WorkTask> _tasks = new();
        private readonly List<Report> _reports = new();

        public string? GithubRepoUrl { get; set; }

        private Groups() { }
        public static Groups Create(string name, string subjectName, int createBy, int limitedUser, MajorType majorType, int ClassroomId, int EnrollmentId)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Tên nhóm không thể để trống");
            if (limitedUser <= 0) throw new DomainException("Giới hạn thành viên phải lớn hơn 0");
            return new Groups
            {
                Name = name,
                SubjectOrProjectName = subjectName,
                CreatedBy = createBy,
                CreatedAt = DateTime.UtcNow,
                LimitedUser = limitedUser,
                IsActive = true,
                MajorType = majorType,
                ClassRoomId = ClassroomId,
                EnrollmentId = EnrollmentId,
            };
        }
        public void InitLeader(GroupMem leader, Classroom classroom)
        {
            if (!IsActive) throw new DomainException("Nhóm đã bị vô hiệu hóa");
            if (!classroom.IsActive) throw new DomainException("Lớp học đã bị vô hiệu hóa");
            if (!classroom.HasStudent(leader.UserId))
                throw new DomainException("Người tạo nhóm phải là thành viên lớp học");
            if (_members.Any())
                throw new DomainException("Nhóm đã có thành viên, không thể khởi tạo lại");
            _members.Add(leader);
        }
        public void SetGithubRepoUrl(string repoUrl)
        {
            if (string.IsNullOrEmpty(repoUrl))
            {
                throw new DomainException("Repo Url không được trống");
            }
            if (MajorType == MajorType.General)
            {
                throw new DomainException("Chỉ nhóm IT mới có thể thiết lập Github Repo URL");
            }
            GithubRepoUrl = repoUrl;
        }
        public void AddTask(WorkTask task)
        {
            if (!IsActive) throw new DomainException("Không thể thêm công việc vào nhóm đã bị vô hiệu hóa");
            _tasks.Add(task);
        }
        // Activity log management
        // Report management
        public void AddReport(Report report)
        {
            if (!IsActive) throw new DomainException("Không thể thêm báo cáo vào nhóm đã bị vô hiệu hóa");
            _reports.Add(report);
        }
        public void RemoveReport(int reportId)
        {
            if (!IsActive) throw new DomainException("Không thể xóa báo cáo khỏi nhóm đã bị vô hiệu hóa");
            var report = _reports.FirstOrDefault(r => r.Id == reportId);
            if (report == null) throw new DomainException("Báo cáo không tồn tại trong nhóm");
            _reports.Remove(report);
        }
        public int ActiveMemberCount()
        {
            return _members.Count(m => m.IsActive);
        }
        public int DoneTasksCount()
        {
            return _tasks.Count(m => m.Status == TasksStatus.Done);
        }
        public int TestTasksCount()
        {
            return _tasks.Count(m => m.Status == TasksStatus.Test);
        }
        public int InProgressTasksCount()
        {
            return _tasks.Count(m => m.Status == TasksStatus.InProgress);
        }
        public int TodoTasksCount()
        {
            return _tasks.Count(m => m.Status == TasksStatus.ToDo);
        }
        public int OverdueTasksCount()
        {
            return _tasks.Count(m => m.IsOverdue());
        }
        public int TotalTaskCount()
        {
            return _tasks.Count;
        }
        public void UpdateDetails(string name, string subjectOrProjectName)
        {
            if (!IsActive) throw new DomainException("Không thể cập nhật nhóm đã bị vô hiệu hóa");
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Tên nhóm không thể để trống");

            Name = name;
            SubjectOrProjectName = subjectOrProjectName;
        }
        public void AddMember(GroupMem member, Classroom classroom, int RequestedBy)
        {
            if (IsFull()) throw new DomainException("Nhóm đã đạt giới hạn thành viên");
            var enrollment = classroom.FindEnrollment(member.UserId);
            if (enrollment == null) throw new DomainException("Người được thêm không phải là thành viên của lớp học");
            if (enrollment.GroupId != null) throw new DomainException("Thành viên này đã có nhóm");
            if (!IsActive) throw new DomainException("Không thể thêm thành viên vào nhóm đã bị vô hiệu hóa");
            if (!classroom.IsActive) throw new DomainException("Không thể thêm thành viên vào nhóm của lớp học đã bị vô hiệu hóa");
            if (!classroom.HasStudent(RequestedBy)) throw new DomainException("Chỉ có thành viên lớp học mới được quyền thêm thành viên vào nhóm");
            if (!IsLeader()) throw new DomainException("Chỉ trưởng nhóm mới được quyền thêm thành viên vào nhóm");

            var existing = FindAllMember(member.UserId);
            if (existing != null)
            {
                if (existing.IsActive) throw new DomainException("Người dùng đã là thành viên");
                existing.Rejoin(); // reactivate thay vì tạo mới
                enrollment.SetGroup(this.Id);
                return;
            }

            _members.Add(member);
            enrollment.SetGroup(this.Id);
        }
        public void RemoveMember(GroupMem member)
        {
            _members.Remove(member);
        }
        public GroupMem? FindOldestMember()
        {
            return _members.OrderBy(x => x.JoinedAt).FirstOrDefault();
        }
        private bool IsFull() => _members.Count(m => m.IsActive) >= LimitedUser;
        public GroupMem? FindMember(int userId)
        {
            return _members.FirstOrDefault(m => m.UserId == userId && m.IsActive);
        }
        public GroupMem? FindAllMember(int userId) => _members.FirstOrDefault(m => m.UserId == userId);
        public GroupMem? FindLeader(int userId)
        {
            return _members.FirstOrDefault(m => m.UserId == userId && m.IsActive && m.Role == GroupMemberRole.Leader);
        }
        public void DeactivateGroup(Classroom classroom, int RequestedBy)
        {
            if (!classroom.IsActive)
                throw new DomainException("Lớp học đã bị vô hiệu hóa");
            if (!IsActive)
                throw new DomainException("Nhóm đã bị vô hiệu hóa rồi");
            if (RequestedBy != classroom.TeacherId)
                throw new DomainException("Chỉ giáo viên nhóm này mới có quyền vô hiệu hóa nhóm");
            IsActive = false;
        }
        public void ReactiveGroup(Classroom classroom)
        {
            if (!classroom.IsActive)
                throw new DomainException("Lớp học đã bị vô hiệu hóa");
            if (IsActive)
                throw new DomainException("Nhóm đã đang hoạt động rồi");
            IsActive = true;
        }
        internal void DeactivateGroup()
        {
            if (!IsActive) return; 
            IsActive = false;
        }
        internal void ReactiveGroup()
        {
            if (IsActive) return;
            IsActive = true;
        }
        private bool IsLeader()
        {
            return _members.Any(m => m.Role == GroupMemberRole.Leader && m.IsActive);
        }
    }
}
