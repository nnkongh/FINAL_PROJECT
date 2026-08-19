using project.Domain.Exceptions;

namespace project.Domain.Models
{
    public class UserApp
    {
        public int Id { get; private set; }
        public string UserName { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;
        public string? RefreshToken { get; set; } = string.Empty;
        public DateTime? RefreshTokenExpiryTime { get; set; }
        public bool IsActive { get; private set; }
        public bool LinkedGithubAccount { get; private set; }
        public string Email { get; private set; } = string.Empty;
        public string? AvatarUrl { get; private set; } = string.Empty;
        public string? UserCode { get; private set; } = string.Empty;
        public string? ResetPasswordToken { get; private set; }
        public DateTime? ResetPasswordTokenExpiry { get; private set; }
        public UserRole UserRole { get; private set; }

        // Github username prop
        public string? GithubUserName { get; private set; }
        public long? GithubId { get; private set; }
        public string? GithubAccessToken { get; private set; }

        public ICollection<GroupMem> GroupMembers => _groupMembers.AsReadOnly();
        public ICollection<WorkTask> AssignedTasks => _assignedTasks.AsReadOnly();
        public ICollection<Comment> Comments => _comments.AsReadOnly();
        public ICollection<Notification> Notifications => _notifications.AsReadOnly();
        public ICollection<Classroom> OwnedClassrooms => _ownedClassrooms.AsReadOnly();
        public ICollection<ClassEnrollment> ClassEnrollments => _classEnrollments.AsReadOnly();


        private readonly List<GroupMem> _groupMembers = new();
        private readonly List<WorkTask> _assignedTasks = new();
        private readonly List<Comment> _comments = new();
        private readonly List<Notification> _notifications = new();
        private readonly List<Classroom> _ownedClassrooms = new();
        private readonly List<ClassEnrollment> _classEnrollments = new();

        private UserApp() { }

        public static UserApp Create(string userName, string email, string passwordHash, string userCode, UserRole userRole)
        {
            if (string.IsNullOrEmpty(userName)) throw new DomainException("Tên không được trống");
            if (string.IsNullOrWhiteSpace(email)) throw new DomainException("Email không được trống");
            if (string.IsNullOrWhiteSpace(userCode)) throw new DomainException("Mã sinh viên/giáo viên không được trống");
            if (string.IsNullOrEmpty(userRole.ToString())) throw new DomainException("Role không được để trống");

            return new UserApp
            {
                UserName = userName,
                Email = email,
                UserCode = userCode,
                UserRole = userRole,
                IsActive = true,
                PasswordHash = passwordHash,
                LinkedGithubAccount = false
            };
        }
        public void UpdateAvatarProfile(string? avatarUrl)
        {
            AvatarUrl = avatarUrl;
        }
        public void ChangePassword(string passwordHash)
        {
            PasswordHash = passwordHash;
        }

        public void SetResetPasswordToken(string token, DateTime expiry)
        {
            ResetPasswordToken = token;
            ResetPasswordTokenExpiry = expiry;
        }

        public void ClearResetPasswordToken()
        {
            ResetPasswordToken = null;
            ResetPasswordTokenExpiry = null;
        }
        public bool IsResetTokenValid(string token)
        {
            return ResetPasswordToken == token
                && ResetPasswordTokenExpiry.HasValue
                && ResetPasswordTokenExpiry.Value > DateTime.UtcNow;
        }
        public void LinkGitHubAccount(string githubUserName, long githubId, string accessToken)
        {
            GithubUserName = githubUserName;
            GithubId = githubId;
            GithubAccessToken = accessToken;
        }
        public void VerifyGithubAccount()
        {
            LinkedGithubAccount = true;
        }
    }
}
