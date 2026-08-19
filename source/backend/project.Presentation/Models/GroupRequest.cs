using project.Domain.Models;

namespace project.Presentation.Models
{
    public class CreateGroupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string SubjectOrProjectName { get; set; } = string.Empty;
        public int LimitedUser { get; set; }
    }
    public class UpdateGroupRequest
    {
        public string Name { get; set; }
        public string SubjectOrProjectName { get; set; }
    }

    public class AddMemberRequest
    {
        public int UserId { get; set; }
        public GroupMemberRole Role { get; set; } = GroupMemberRole.Member;
    }

    public class UpdateMemberRoleRequest
    {
        public GroupMemberRole NewRole { get; set; }
    }
    public class RepoUpdateRequest
    {
        public string RepoUrl { get; set; }
    }

}
