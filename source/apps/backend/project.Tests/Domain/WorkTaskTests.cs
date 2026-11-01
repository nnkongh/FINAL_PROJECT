using FluentAssertions;
using project.Domain.Exceptions;
using project.Domain.Models;

namespace project.Tests.Domain;

public class WorkTaskTests
{
    [Fact]
    public void Create_WithEmptyTitle_ShouldThrowDomainException()
    {
        var act = () => WorkTask.Create(1, "", 1, TasksStatus.ToDo);

        act.Should().Throw<DomainException>().WithMessage("Tên tiêu đề không thể để trống");
    }

    [Fact]
    public void Create_WithInvalidStatus_ShouldThrowDomainException()
    {
        var act = () => WorkTask.Create(1, "Task A", 1, TasksStatus.Done);

        act.Should().Throw<DomainException>()
            .WithMessage("Trạng thái của task chỉ có thể là 'Todo' hoặc 'InProgress'");
    }

    [Fact]
    public void Create_WithInProgressStatus_ShouldSetStartDate()
    {
        var before = DateTime.UtcNow.AddSeconds(-1);

        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.InProgress);

        task.Status.Should().Be(TasksStatus.InProgress);
        task.StartDate.Should().NotBeNull();
        task.StartDate.Should().BeAfter(before);
    }

    [Fact]
    public void Create_WithToDoStatus_ShouldNotSetStartDate()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);

        task.Status.Should().Be(TasksStatus.ToDo);
        task.StartDate.Should().BeNull();
    }

    [Fact]
    public void Start_WhenStatusIsToDo_ShouldTransitionToInProgress()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);

        task.Start();

        task.Status.Should().Be(TasksStatus.InProgress);
        task.StartDate.Should().NotBeNull();
    }

    [Fact]
    public void Start_WhenStatusIsNotToDo_ShouldThrow()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.InProgress);

        var act = () => task.Start();

        act.Should().Throw<DomainException>()
            .WithMessage("Chỉ có thể bắt đầu công việc ở trạng thái 'To Do'");
    }

    [Fact]
    public void Test_WhenStatusIsInProgress_ShouldTransitionToTest()
    {
        var task = CreateTaskInProgress();

        task.Test();

        task.Status.Should().Be(TasksStatus.Test);
    }

    [Fact]
    public void Test_WhenStatusIsNotInProgress_ShouldThrow()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);

        var act = () => task.Test();

        act.Should().Throw<DomainException>()
            .WithMessage("Chỉ có thể test ở trạng thái 'In Progress'");
    }

    [Fact]
    public void Complete_WhenStatusIsTest_ShouldTransitionToDone()
    {
        var task = CreateTaskInProgress();
        task.Test();

        task.Complete();

        task.Status.Should().Be(TasksStatus.Done);
        task.CompletedAt.Should().NotBeNull();
    }

    [Fact]
    public void Complete_WhenStatusIsNotTest_ShouldThrow()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);

        var act = () => task.Complete();

        act.Should().Throw<DomainException>()
            .WithMessage("Chỉ có thể hoàn thành công việc ở trạng thái 'Test'");
    }

    [Fact]
    public void Reject_WhenStatusIsTest_ShouldTransitionToInProgress()
    {
        var task = CreateTaskInProgress();
        task.Test();

        task.Reject();

        task.Status.Should().Be(TasksStatus.InProgress);
        task.CompletedAt.Should().BeNull();
    }

    [Fact]
    public void Reject_WhenStatusIsNotTest_ShouldThrow()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);

        var act = () => task.Reject();

        act.Should().Throw<DomainException>()
            .WithMessage("Chỉ có thể từ chối task ở trạng thái 'Test'");
    }

    [Fact]
    public void Reopen_WhenStatusIsDone_ShouldTransitionToInProgress()
    {
        var task = CreateTaskInProgress();
        task.Test();
        task.Complete();

        task.Reopen();

        task.Status.Should().Be(TasksStatus.InProgress);
        task.CompletedAt.Should().BeNull();
    }

    [Fact]
    public void Reopen_WhenStatusIsNotDone_ShouldThrow()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);

        var act = () => task.Reopen();

        act.Should().Throw<DomainException>()
            .WithMessage("Chỉ có thể mở lại nếu nhiệm vụ ở trạng thái 'Complete' ");
    }

    [Fact]
    public void Assign_ShouldSetAssignedTo()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);

        task.Assign(42);

        task.AssignedTo.Should().Be(42);
        task.IsAssigned().Should().BeTrue();
    }

    [Fact]
    public void Assign_WhenDone_ShouldThrow()
    {
        var task = CreateTaskInProgress();
        task.Test();
        task.Complete();

        var act = () => task.Assign(42);

        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void UnAssigned_ShouldClearAssignee()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);
        task.Assign(42);

        task.UnAssigned();

        task.AssignedTo.Should().BeNull();
    }

    [Fact]
    public void SetDueDate_WithPastDate_ShouldThrow()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);

        var act = () => task.SetDueDate(DateTime.UtcNow.AddDays(-1));

        act.Should().Throw<DomainException>()
            .WithMessage("Ngày đến hạn phải là ngày trong tương lai");
    }

    [Fact]
    public void SetDueDate_WithFutureDate_ShouldSucceed()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);
        var future = DateTime.UtcNow.AddDays(3);

        task.SetDueDate(future);

        task.DueDate.Should().BeCloseTo(future, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void IsOverdue_WhenPastDueAndNotDone_ShouldReturnTrue()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);
        typeof(WorkTask).GetProperty("DueDate")?.SetValue(task, DateTime.UtcNow.AddDays(-1));

        task.IsOverdue().Should().BeTrue();
    }

    [Fact]
    public void IsOverdue_WhenDone_ShouldReturnFalse()
    {
        var task = CreateTaskInProgress();
        task.Test();
        task.Complete();

        task.IsOverdue().Should().BeFalse();
    }

    [Fact]
    public void UpdateDetails_WhenDone_ShouldThrow()
    {
        var task = CreateTaskInProgress();
        task.Test();
        task.Complete();

        var act = () => task.UpdateDetails("New title", null, TaskPriority.High, TasksStatus.ToDo);

        act.Should().Throw<DomainException>()
            .WithMessage("Không thể cập nhật chi tiết khi công việc đã hoàn thành");
    }

    [Fact]
    public void UpdateDetails_ShouldUpdateFields()
    {
        var task = WorkTask.Create(1, "Old title", 1, TasksStatus.ToDo);

        task.UpdateDetails("New title", "New desc", TaskPriority.High, TasksStatus.InProgress);

        task.Title.Should().Be("New title");
        task.Description.Should().Be("New desc");
        task.Priority.Should().Be(TaskPriority.High);
        task.Status.Should().Be(TasksStatus.InProgress);
    }

    [Fact]
    public void Duration_WhenCompleted_ShouldCalculate()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);
        typeof(WorkTask).GetProperty("StartDate")?.SetValue(task, DateTime.UtcNow.AddHours(-2));

        task.Start();
        task.Test();
        task.Complete();

        task.Duration.Should().NotBeNull();
        task.Duration!.Value.TotalHours.Should().BeGreaterThan(0);
    }

    [Fact]
    public void ActivateBranch_ShouldSetHasBranch()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);

        task.ActivateBranch();

        task.HasBranch.Should().BeTrue();
    }

    [Fact]
    public void DeactivateBranch_ShouldClearHasBranch()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);
        task.ActivateBranch();

        task.DeactivateBranch();

        task.HasBranch.Should().BeFalse();
    }

    [Fact]
    public void FullWorkflow_ShouldFollowExpectedTransitions()
    {
        var task = WorkTask.Create(1, "Full workflow task", 1, TasksStatus.ToDo);

        task.Start();
        task.Status.Should().Be(TasksStatus.InProgress);

        task.Test();
        task.Status.Should().Be(TasksStatus.Test);

        task.Reject();
        task.Status.Should().Be(TasksStatus.InProgress);

        task.Test();
        task.Status.Should().Be(TasksStatus.Test);

        task.Complete();
        task.Status.Should().Be(TasksStatus.Done);
        task.CompletedAt.Should().NotBeNull();

        task.Reopen();
        task.Status.Should().Be(TasksStatus.InProgress);
        task.CompletedAt.Should().BeNull();
    }

    private static WorkTask CreateTaskInProgress()
    {
        var task = WorkTask.Create(1, "Task A", 1, TasksStatus.ToDo);
        typeof(WorkTask).GetProperty("Status")?.SetValue(task, TasksStatus.InProgress);
        typeof(WorkTask).GetProperty("StartDate")?.SetValue(task, DateTime.UtcNow);
        return task;
    }
}
