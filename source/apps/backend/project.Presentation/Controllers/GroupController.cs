using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using project.Application.Features.Command.Group.AddMem;
using project.Application.Features.Command.Group.Create;
using project.Application.Features.Command.Group.Deactivate;
using project.Application.Features.Command.Group.Delete;
using project.Application.Features.Command.Group.Join;
using project.Application.Features.Command.Group.Promote;
using project.Application.Features.Command.Group.Reactive;
using project.Application.Features.Command.Group.RemoveMem;
using project.Application.Features.Command.Group.Update;
using project.Application.Features.Command.Group.UpdateGroupRepo;
using project.Application.Features.Command.Reports.ExportGroupPdf;
using project.Application.Features.Query.Group;
using project.Application.Features.Query.Group.GetAllGroupByUser;
using project.Application.Features.Query.Group.GetById;
using project.Application.Features.Query.Group.GetDetailGroup;
using project.Application.Features.Query.Group.GetMemberGroup;
using project.Application.Features.Query.Group.GetTotalContributionQuery;
using project.Application.Features.Query.Group.GetUrlRepo;
using project.Application.Features.Query.Group.Github;
using project.Application.Features.Query.Report.DownloadReport;
using project.Presentation.Extension;
using project.Presentation.Models;

namespace project.Presentation.Controllers
{
    [Route("api/group")]
    [Authorize]
    public class GroupController : ApiController
    {
        public GroupController(ISender sender) : base(sender)
        {
        }

        [HttpPost("{groupId}/member")]
        public async Task<IActionResult> AddMember(int groupId, [FromBody] AddMemberRequest request)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();

            var command = new AddMemberCommand(groupId, request.UserId, user.Value, request.Role);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpDelete("{groupId}/member/{userId}")]
        public async Task<IActionResult> RemoveMember(int groupId, int userId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();

            var command = new RemoveMemberCommand(groupId, userId, user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("{groupId}/members/{userId}")]
        public async Task<IActionResult> PromoteMember(int groupId, int userId, [FromBody] UpdateMemberRoleRequest request)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();

            var command = new PromoteMemberCommand(groupId, userId, request.NewRole, user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("{groupId}/members")]
        public async Task<IActionResult> GetMembers(int groupId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetMembersQuery(groupId, user.Value);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("{groupId}/detail")]
        public async Task<IActionResult> GetDetailGroup(int groupId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetDetailGroupQuery(groupId, user.Value);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }

        [HttpGet("my-groups")]
        public async Task<IActionResult> GetGroups()
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetGroupsByUserQuery(user.Value);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("{groupId}")]
        public async Task<IActionResult> UpdateGroup(int groupId, UpdateGroupRequest request)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new UpdateGroupCommand(user.Value, groupId, request.Name, request.SubjectOrProjectName);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpDelete("{groupId}")]
        public async Task<IActionResult> DeleteGroup(int groupId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new DeleteGroupCommand(user.Value, groupId);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }

        [HttpPut("{groupId}/deactivate")]
        public async Task<IActionResult> DeactivateGroup(int groupId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new DeactivateGroupCommand(groupId, user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("{groupId}/reactive")]
        public async Task<IActionResult> ReactiveGroup(int groupId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new ReactiveGroupCommand(groupId, user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("{groupId}/update-github-repo")]
        public async Task<IActionResult> UpdateGithubRepo(int groupId, RepoUpdateRequest request)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new UpdateGroupRepoCommand(user.Value, groupId, request.RepoUrl);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);

        }
        [HttpGet("{groupId}/repo")]
        public async Task<IActionResult> GetRepoUrl(int groupId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetRepoGithubQuery(user.Value, groupId);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("{groupId}/contribution")]
        public async Task<IActionResult> GetTotalContribution(int groupId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetTotalContributionQuery(user.Value, groupId);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPost("{groupId}/report-generated")]
        public async Task<IActionResult> ReportGroup(int groupId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new ExportGroupReportCommand(user.Value,groupId);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("report/{reportId}/download")]
        public async Task<IActionResult> DownloadReport(int reportId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new DownloadReportQuery(reportId, user.Value);
            var result = await _sender.Send(query);
            if (!result.IsSuccess) return BadRequest(result.Error);
            var fileName = $"Baocao_{reportId}_{DateTime.UtcNow:yyyyMMdd}.pdf";
            return File(result.Value, "application/pdf", fileName);
        }

        [HttpPost("{groupId}/join-request")]
        public async Task<IActionResult> RequestJoinGroup(int groupId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new RequestJoinGroupCommand(user.Value, groupId);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("{groupId}")]
        public async Task<IActionResult> GetGroupById(int groupId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetGroupByIdQuery(user.Value,groupId);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
    }
}
