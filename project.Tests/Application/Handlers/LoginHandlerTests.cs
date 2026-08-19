using FluentAssertions;
using Moq;
using project.Application.Features.Command.Auth.Login;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Tests.Application.Handlers;

public class LoginHandlerTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<ITokenGenerator> _tokenGenerator = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly LoginHandler _handler;

    public LoginHandlerTests()
    {
        _handler = new LoginHandler(
            _tokenGenerator.Object,
            _passwordHasher.Object,
            _userRepo.Object,
            _unitOfWork.Object);
    }

    [Fact]
    public async Task Handle_WithEmptyMSSV_ShouldReturnFailure()
    {
        var command = new LoginCommand("", "password123");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Message.Should().Be("Dữ liệu đăng nhập không được phép để trống");
    }

    [Fact]
    public async Task Handle_WithEmptyPassword_ShouldReturnFailure()
    {
        var command = new LoginCommand("MSSV001", "");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Message.Should().Be("Dữ liệu đăng nhập không được phép để trống");
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ShouldReturnFailure()
    {
        _userRepo.Setup(r => r.FindByUserCode("MSSV001")).ReturnsAsync((UserApp?)null);
        var command = new LoginCommand("MSSV001", "password123");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Message.Should().Be("Tài khoản không tồn tại");
    }

    [Fact]
    public async Task Handle_WithInactiveUser_ShouldReturnFailure()
    {
        var user = CreateUser("MSSV001", isActive: false);
        _userRepo.Setup(r => r.FindByUserCode("MSSV001")).ReturnsAsync(user);
        var command = new LoginCommand("MSSV001", "password123");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Message.Should().Be("Tài khoản đã bị khóa");
    }

    [Fact]
    public async Task Handle_WithWrongPassword_ShouldReturnFailure()
    {
        var user = CreateUser("MSSV001", isActive: true);
        _userRepo.Setup(r => r.FindByUserCode("MSSV001")).ReturnsAsync(user);
        _passwordHasher.Setup(p => p.Verify("wrong", user.PasswordHash)).Returns(false);
        var command = new LoginCommand("MSSV001", "wrong");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Message.Should().Be("Mật khẩu không chính xác");
    }

    [Fact]
    public async Task Handle_WithValidCredentials_ShouldReturnToken()
    {
        var user = CreateUser("MSSV001", isActive: true);
        var expectedToken = new TokenModel
        {
            AccessToken = "access-token",
            RefreshToken = "refresh-token"
        };

        _userRepo.Setup(r => r.FindByUserCode("MSSV001")).ReturnsAsync(user);
        _passwordHasher.Setup(p => p.Verify("correct", user.PasswordHash)).Returns(true);
        _tokenGenerator.Setup(t => t.CreateToken(user, true)).ReturnsAsync(expectedToken);

        var command = new LoginCommand("MSSV001", "correct");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedToken);
        user.RefreshToken.Should().Be("refresh-token");
        user.RefreshTokenExpiryTime.Should().BeCloseTo(DateTime.UtcNow.AddDays(7), TimeSpan.FromSeconds(5));
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    private static UserApp CreateUser(string userCode, bool isActive)
    {
        var user = UserApp.Create("Test User", "test@test.com", "hashed-password", userCode, UserRole.Student);
        var field = typeof(UserApp).GetField("_isActive", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        if (field != null)
            field.SetValue(user, isActive);
        else
        {
            var prop = typeof(UserApp).GetProperty("IsActive", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
            prop?.SetValue(user, isActive);
        }
        return user;
    }
}
