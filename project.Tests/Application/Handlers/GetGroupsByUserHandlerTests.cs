using AutoMapper;
using FluentAssertions;
using Moq;
using project.Application.Features.Query.Group.GetAllGroupByUser;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Tests.Application.Handlers;

public class GetGroupsByUserHandlerTests
{
    private readonly Mock<IGroupRepository> _groupRepo = new();
    private readonly Mock<IMapper> _mapper = new();
    private readonly GetGroupsByUserHandler _handler;

    public GetGroupsByUserHandlerTests()
    {
        _handler = new GetGroupsByUserHandler(_groupRepo.Object, _mapper.Object);
    }

    [Fact]
    public async Task Handle_WhenNoGroups_ShouldReturnFailure()
    {
        _groupRepo.Setup(r => r.GetAllGroupsByUserIdAsync(1)).ReturnsAsync((List<Groups>?)null);
        var query = new GetGroupsByUserQuery(1);

        var result = await _handler.Handle(query, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Message.Should().Be("Bạn chưa có nhóm nào");
    }

    [Fact]
    public async Task Handle_WhenGroupsExist_ShouldReturnMappedList()
    {
        var groups = new List<Groups> { CreateGroup("Nhóm A"), CreateGroup("Nhóm B") };
        var dtos = new List<GroupModel>
        {
            new() { Id = 1, Name = "Nhóm A" },
            new() { Id = 2, Name = "Nhóm B" }
        };

        _groupRepo.Setup(r => r.GetAllGroupsByUserIdAsync(1)).ReturnsAsync(groups);
        _mapper.Setup(m => m.Map<IReadOnlyList<GroupModel>>(groups)).Returns(dtos);
        var query = new GetGroupsByUserQuery(1);

        var result = await _handler.Handle(query, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
        result.Value.Should().BeEquivalentTo(dtos);
    }

    private static Groups CreateGroup(string name)
    {
        return Groups.Create(name, "Subject", 1, 5, MajorType.IT, 1, 1);
    }
}
