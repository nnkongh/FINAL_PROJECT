using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using project.Application.Features.Command.User;
using project.Application.Features.Command.User.AvatarProfile;
using project.Application.Features.Command.User.ChangePassword;
using project.Application.Features.Command.User.Import;
using project.Application.Features.Query.Profile;
using project.Application.Features.Query.Users;
using project.Domain.Models;
using project.Presentation.Extension;
using project.Presentation.Models.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime.CompilerServices;
using System.Security.Claims;

namespace project.Presentation.Controllers
{
    [Route("api/user")]
    [Authorize]
    public class UserController : ApiController
    {
        public UserController(ISender sender) : base(sender)
        {
        }

        [HttpGet("profile")]
        public async Task<IActionResult> Profile()
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var query = new UserProfileQuery(userId.Value);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
        }
        [HttpPut("avatar")]
        public async Task<IActionResult> UpdateAvatar(IFormFile file)
        {
            if (file.Length == 0 || file == null) return BadRequest("File không được để trống");

            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            var fileBytes = stream.ToArray();

            var command = new ChangeAvatarCommand(userId.Value, fileBytes, file.FileName, file.ContentType);
            var result = await _sender.Send(command);

            return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
        }
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new ChangePasswordCommand(userId.Value, request.OldPassword, request.NewPassword, request.PasswordConfirm);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok() : BadRequest(result.Error);
        }
        [HttpPost("import")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ImportUsers(IFormFile file, CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Vui lòng chọn file Excel");
            }
            if (!file.FileName.EndsWith(".xlsx"))
            {
                return BadRequest("Chỉ chấp nhận file .xlsx");
            }

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream, cancellationToken);
            var fileBytes = stream.ToArray();

            var command = new ImportUserCommand(fileBytes);
            var result = await _sender.Send(command);

            if (result.Failed > 0)
            {
                return Ok(new { Message = $"Import hoàn tất: {result.Success} thành công, {result.Failed} thất bại" });
            }
            return Ok(new { Message = $"Import thành công {result.Success} người dùng" });
        }
        [HttpGet("search")]
        public async Task<IActionResult> SearchUser([FromQuery] string keyword)
        {
            var query = new SearchUserQuery(keyword);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
        }
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] string? role,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();

            var query = new GetUsersQuery(role, user.Value, page, pageSize);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
        }
    }
}
