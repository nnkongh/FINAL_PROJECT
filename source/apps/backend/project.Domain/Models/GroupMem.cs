using project.Domain.Exceptions;

namespace project.Domain.Models
{
    public class GroupMem
    {
        public int Id { get; private set; }
        public int GroupId { get; private set; }
        public int UserId { get; private set; }
        public bool IsActive { get; private set; } = true;
        public MajorType MajorType { get; private set; }
        public GroupMemberRole Role { get; private set; } = GroupMemberRole.Member;
        public DateTime JoinedAt { get; private set; }
        public DateTime? LeftAt { get; private set; }
        public Groups Group { get; private set; }
        public UserApp User { get; private set; }
        public int Contribution { get; private set; } = 0;
        private GroupMem() { }

        public static GroupMem Create(Groups group,int userId, GroupMemberRole role = GroupMemberRole.Member)
        {
            return new GroupMem
            {
                Group = group,
                UserId = userId,
                Role = role,
                IsActive = true,
                JoinedAt = DateTime.UtcNow
            };
        }
        public double CalculateTotalContributionITStudent(int Commit)
        {
            return Math.Round((Contribution * 0.6) + (Commit * 0.4), 2);

        }
        public double CalculateTotalContributionGeneralStudent()
        {
            return Math.Round((Contribution * 1.0), 2);
        }
        public void AddContribution()
        {
            Contribution++;
        }
        public void Rejoin()
        {
            if (IsActive) throw new DomainException("Thành viên đang hoạt động");
            IsActive = true;
            LeftAt = null;
            JoinedAt = DateTime.UtcNow;
        }
        public void Leave()
        {
            if (!IsActive) throw new DomainException("Thành viên đã rời nhóm");
            LeftAt = DateTime.UtcNow;
            IsActive = false;
        }

        public void PromoteTo(GroupMemberRole newRole)
        {
            if (!IsActive) throw new DomainException("Thành viên không còn trong nhóm");
            if (Role == newRole) throw new DomainException($"Thành viên đã có role {newRole} rồi");

            Role = newRole;
        }
        public bool IsLeader() => Role == GroupMemberRole.Leader;
        public bool CanManageTasks() => Role is GroupMemberRole.Leader;
    }
}
