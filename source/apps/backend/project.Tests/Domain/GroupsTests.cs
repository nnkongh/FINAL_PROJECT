using FluentAssertions;
using project.Domain.Exceptions;
using project.Domain.Models;

namespace project.Tests.Domain;

public class GroupsTests
{
    [Fact]
    public void Create_WithEmptyName_ShouldThrow()
    {
        var act = () => Groups.Create("", "Subject", 1, 5, MajorType.IT, 1, 1);

        act.Should().Throw<DomainException>().WithMessage("Tên nhóm không thể để trống");
    }

    [Fact]
    public void Create_WithInvalidLimit_ShouldThrow()
    {
        var act = () => Groups.Create("Nhóm A", "Subject", 1, 0, MajorType.IT, 1, 1);

        act.Should().Throw<DomainException>().WithMessage("Giới hạn thành viên phải lớn hơn 0");
    }

    [Fact]
    public void Create_ShouldSetDefaultValues()
    {
        var group = Groups.Create("Nhóm A", "Đồ án 1", 1, 5, MajorType.IT, 1, 1);

        group.Name.Should().Be("Nhóm A");
        group.SubjectOrProjectName.Should().Be("Đồ án 1");
        group.LimitedUser.Should().Be(5);
        group.MajorType.Should().Be(MajorType.IT);
        group.IsActive.Should().BeTrue();
    }

    [Fact]
    public void UpdateDetails_WithEmptyName_ShouldThrow()
    {
        var group = Groups.Create("Nhóm A", "Subject", 1, 5, MajorType.IT, 1, 1);

        var act = () => group.UpdateDetails("", "New subject");

        act.Should().Throw<DomainException>().WithMessage("Tên nhóm không thể để trống");
    }

    [Fact]
    public void UpdateDetails_WhenDeactivated_ShouldThrow()
    {
        var group = Groups.Create("Nhóm A", "Subject", 1, 5, MajorType.IT, 1, 1);
        var classroom = CreateClassroom(teacherId: 1);
        group.DeactivateGroup(classroom, 1);

        var act = () => group.UpdateDetails("New name", "New subject");

        act.Should().Throw<DomainException>().WithMessage("Không thể cập nhật nhóm đã bị vô hiệu hóa");
    }

    [Fact]
    public void UpdateDetails_ShouldUpdateFields()
    {
        var group = Groups.Create("Old name", "Old subject", 1, 5, MajorType.IT, 1, 1);

        group.UpdateDetails("New name", "New subject");

        group.Name.Should().Be("New name");
        group.SubjectOrProjectName.Should().Be("New subject");
    }

    [Fact]
    public void SetGithubRepoUrl_ForGeneralGroup_ShouldThrow()
    {
        var group = Groups.Create("Nhóm A", "Subject", 1, 5, MajorType.General, 1, 1);

        var act = () => group.SetGithubRepoUrl("https://github.com/owner/repo");

        act.Should().Throw<DomainException>()
            .WithMessage("Chỉ nhóm IT mới có thể thiết lập Github Repo URL");
    }

    [Fact]
    public void SetGithubRepoUrl_WithEmptyUrl_ShouldThrow()
    {
        var group = Groups.Create("Nhóm A", "Subject", 1, 5, MajorType.IT, 1, 1);

        var act = () => group.SetGithubRepoUrl("");

        act.Should().Throw<DomainException>().WithMessage("Repo Url không được trống");
    }

    [Fact]
    public void SetGithubRepoUrl_ShouldSetUrl()
    {
        var group = Groups.Create("Nhóm A", "Subject", 1, 5, MajorType.IT, 1, 1);

        group.SetGithubRepoUrl("https://github.com/owner/repo");

        group.GithubRepoUrl.Should().Be("https://github.com/owner/repo");
    }

    [Fact]
    public void AddMember_WhenFull_ShouldThrow()
    {
        var group = Groups.Create("Nhóm A", "Subject", 1, 1, MajorType.IT, 1, 1);
        var classroom = CreateClassroom(teacherId: 1);
        var leader = CreateGroupMem(1, GroupMemberRole.Leader);
        AddStudentToClassroom(classroom, 1);
        group.InitLeader(leader, classroom);

        var member2 = CreateGroupMem(2, GroupMemberRole.Member);
        var act = () => group.AddMember(member2, classroom, 1);

        act.Should().Throw<DomainException>().WithMessage("Nhóm đã đạt giới hạn thành viên");
    }

    [Fact]
    public void ActiveMemberCount_ShouldReturnOnlyActive()
    {
        var classroom = CreateClassroom(teacherId: 1);
        var group = Groups.Create("Nhóm A", "Subject", 1, 10, MajorType.IT, 1, 1);
        var leader = CreateGroupMem(1, GroupMemberRole.Leader);
        AddStudentToClassroom(classroom, 1);
        group.InitLeader(leader, classroom);

        group.ActiveMemberCount().Should().Be(1);
    }

    private static void AddStudentToClassroom(Classroom classroom, int userId)
    {
        var user = UserApp.Create("Student " + userId, $"s{userId}@test.com", "hash", $"S{userId:D3}", UserRole.Student);
        typeof(UserApp).GetProperty("Id")?.SetValue(user, userId);
        var enrollment = ClassEnrollment.Create(classroom, user);
        var field = typeof(Classroom).GetField("_enrollments", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        var list = field?.GetValue(classroom) as System.Collections.IList;
        list?.Add(enrollment);
    }

    [Fact]
    public void TaskCounts_ShouldReturnCorrectValues()
    {
        var group = Groups.Create("Nhóm A", "Subject", 1, 10, MajorType.IT, 1, 1);

        group.AddTask(CreateTaskWithStatus(TasksStatus.ToDo));
        group.AddTask(CreateTaskWithStatus(TasksStatus.InProgress));
        group.AddTask(CreateTaskWithStatus(TasksStatus.Test));
        group.AddTask(CreateTaskWithStatus(TasksStatus.Done));

        group.TotalTaskCount().Should().Be(4);
        group.TodoTasksCount().Should().Be(1);
        group.InProgressTasksCount().Should().Be(1);
        group.TestTasksCount().Should().Be(1);
        group.DoneTasksCount().Should().Be(1);
    }

    [Fact]
    public void DeactivateGroup_ShouldSetInactive()
    {
        var classroom = CreateClassroom(teacherId: 1);
        var group = Groups.Create("Nhóm A", "Subject", 1, 10, MajorType.IT, 1, 1);

        group.DeactivateGroup(classroom, 1);

        group.IsActive.Should().BeFalse();
    }

    [Fact]
    public void DeactivateGroup_ByNonTeacher_ShouldThrow()
    {
        var classroom = CreateClassroom(teacherId: 1);
        var group = Groups.Create("Nhóm A", "Subject", 1, 10, MajorType.IT, 1, 1);

        var act = () => group.DeactivateGroup(classroom, 99);

        act.Should().Throw<DomainException>()
            .WithMessage("Chỉ giáo viên nhóm này mới có quyền vô hiệu hóa nhóm");
    }

    [Fact]
    public void ReactiveGroup_ShouldSetActive()
    {
        var classroom = CreateClassroom(teacherId: 1);
        var group = Groups.Create("Nhóm A", "Subject", 1, 10, MajorType.IT, 1, 1);
        group.DeactivateGroup(classroom, 1);

        group.ReactiveGroup(classroom);

        group.IsActive.Should().BeTrue();
    }

    [Fact]
    public void AddReport_WhenDeactivated_ShouldThrow()
    {
        var classroom = CreateClassroom(teacherId: 1);
        var group = Groups.Create("Nhóm A", "Subject", 1, 10, MajorType.IT, 1, 1);
        group.DeactivateGroup(classroom, 1);

        var act = () => group.AddReport(Report.Create(1, 1, "Test report"));

        act.Should().Throw<DomainException>()
            .WithMessage("Không thể thêm báo cáo vào nhóm đã bị vô hiệu hóa");
    }

    private static Classroom CreateClassroom(int teacherId)
    {
        var teacher = UserApp.Create("Teacher", "teacher@test.com", "hash", "T001", UserRole.Teacher);
        var classroom = Classroom.Create("Lớp A", "Môn", MajorType.IT, 5, teacher);
        typeof(Classroom).GetProperty("TeacherId")?.SetValue(classroom, teacherId);
        typeof(Classroom).GetProperty("IsActive")?.SetValue(classroom, true);
        return classroom;
    }

    private static GroupMem CreateGroupMem(int userId, GroupMemberRole role)
    {
        var user = UserApp.Create("User " + userId, $"user{userId}@test.com", "hash", $"U{userId:D3}", UserRole.Student);
        var group = Groups.Create("Temp", "Subject", 1, 10, MajorType.IT, 1, 1);
        return GroupMem.Create(group, userId, role);
    }

    private static WorkTask CreateTaskWithStatus(TasksStatus status)
    {
        var task = WorkTask.Create(1, "Task", 1, TasksStatus.ToDo);
        typeof(WorkTask).GetProperty("Status")?.SetValue(task, status);
        return task;
    }
}
