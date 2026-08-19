using FluentAssertions;
using Moq;
using project.Application.Features.Query.Comments;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Tests.Application.Handlers;

public class GetCommentsHandlerTests
{
    private readonly Mock<ICommentRepository> _commentRepo = new();
    private readonly GetCommentsHandler _handler;

    public GetCommentsHandlerTests()
    {
        _handler = new GetCommentsHandler(_commentRepo.Object);
    }

    [Fact]
    public async Task Handle_WhenNoComments_ShouldReturnEmptyList()
    {
        _commentRepo.Setup(r => r.GetCommentsByTaskIdAsync(1)).ReturnsAsync((List<Comment>?)null);
        var query = new GetCommentsQuery(1);

        var result = await _handler.Handle(query, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WithComments_ShouldMapCorrectly()
    {
        var comments = new List<Comment> { CreateComment(1, "Nội dung bình luận", userId: 1) };
        _commentRepo.Setup(r => r.GetCommentsByTaskIdAsync(1)).ReturnsAsync(comments);
        var query = new GetCommentsQuery(1);

        var result = await _handler.Handle(query, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].Id.Should().Be(1);
        result.Value[0].Content.Should().Be("Nội dung bình luận");
        result.Value[0].CreatedBy.Should().Be(1);
    }

    private static Comment CreateComment(int id, string content, int userId)
    {
        var teacher = UserApp.Create("Teacher", "teacher@test.com", "hash", "T001", UserRole.Teacher);
        var creator = UserApp.Create("User", "user@test.com", "hash", "U001", UserRole.Student);
        var classroom = Classroom.Create("Lớp A", "Môn", MajorType.IT, 5, teacher);
        var group = Groups.Create("Nhóm A", "Project", 1, 5, MajorType.IT, 1, 1);
        var task = WorkTask.Create(1, "Task title", 1, TasksStatus.ToDo);

        var comment = Comment.Create(1, userId, content);
        typeof(Comment).GetProperty("Id", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)?.SetValue(comment, id);

        var taskField = typeof(Comment).GetProperty("Task", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
        taskField?.SetValue(comment, task);

        var userField = typeof(Comment).GetProperty("User", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
        userField?.SetValue(comment, creator);

        var groupsField = typeof(WorkTask).GetProperty("Groups", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
        groupsField?.SetValue(task, group);

        var classroomField = typeof(Groups).GetProperty("Classroom", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
        classroomField?.SetValue(group, classroom);

        return comment;
    }
}
