using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using project.Application.Features.Command.Classrooms.Activate;
using project.Application.Features.Command.Classrooms.Create;
using project.Application.Features.Command.Classrooms.Deactivate;
using project.Application.Features.Command.Classrooms.Delete;
using project.Application.Features.Command.Classrooms.DisolveGroup;
using project.Application.Features.Command.Classrooms.JoinClass;
using project.Application.Features.Command.Classrooms.ReGenerateInviteCode;
using project.Application.Features.Command.Classrooms.RemoveStudent;
using project.Application.Features.Command.Classrooms.Reports;
using project.Application.Features.Command.Classrooms.Update;
using project.Application.Features.Command.Group.Create;
using project.Application.Features.Query.Classrooms.GetAllClass;
using project.Application.Features.Query.Classrooms.GetCodeByClassId;
using project.Application.Features.Query.Classrooms.GetEnrollmentByClassId;
using project.Application.Features.Query.Classrooms.GetGroupsByClassId;
using project.Application.Features.Query.Group.GetClassById;
using project.Presentation.Extension;
using project.Presentation.Models;
using System.Threading.Tasks;

namespace project.Presentation.Controllers
{
    [Authorize]
    [Route("api/classroom")]
    public class ClassroomController : ApiController
    {
        public ClassroomController(ISender sender) : base(sender)
        {
        }

        [HttpPost]
        public async Task<IActionResult> CreateClassroom([FromBody] CreateClassRequest request)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new CreateClassCommand(userId.Value, request.ClassName, request.SubjectName, request.MajorType, request.MaxMembersPerGroup);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }

        [HttpPut("{classroomId}/activate")]
        [Authorize(Roles = "Teacher")]  
        public async Task<IActionResult> ActivateClassroom(int classroomId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new ActivateClassCommand(userId.Value, classroomId);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }

        [HttpPut("{classroomId}/deactivate")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeactivateClassroom(int classroomId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new DeactivateCommand(userId.Value, classroomId);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }

        [HttpDelete("{classroomId}/groups/{groupId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DissolveGroup(int classroomId, int groupId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new DisolveGroupCommand(userId.Value, classroomId, groupId);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPost("join")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> JoinClassRoom([FromBody] JoinClassRequest request)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new JoinClassCommand(userId.Value, request.ClassCode);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }

        [HttpPost("{classroomId}/invite-code")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> RegenerateInviteCode(int classroomId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new ReGenerateInviteCodeCommand(userId.Value, classroomId);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }

        [HttpPut("{classroomId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateClassroom(int classroomId, [FromBody] UpdateClassRequest request)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new UpdateClassCommand(userId.Value, classroomId, request.SubjectName, request.ClassName);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPost("{classroomId}/groups")]
        public async Task<IActionResult> CreateGroup(int classroomId, [FromBody] CreateGroupRequest request)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new CreateGroupCommand(request.Name, request.SubjectOrProjectName,
                                                 userId.Value, request.LimitedUser, classroomId);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }

        [HttpGet("{classroomId}/groups")]
        public async Task<IActionResult> GetGroupsByClassroom(int classroomId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var query = new GetGroupsByClassIdQuery(userId.Value, classroomId);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("my-classrooms")]
        public async Task<IActionResult> GetMyClassrooms()
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var query = new GetAllClassQuery(userId.Value);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("{classroomId}")] 
        public async Task<IActionResult> GetClassroomById(int classroomId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var query = new GetClassByIdQuery(userId.Value, classroomId);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("{classroomId}/enrollment")]
        public async Task<IActionResult> GetEnrollment(int classroomId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var query = new GetEnrollmentByClassIdQuery(userId.Value, classroomId);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [Authorize(Roles = "Teacher")]
        [HttpGet("{classroomId}/code")]
        public async Task<IActionResult> GetClassCode(int classroomId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var query = new GetClassCodeQuery(classroomId);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPost("{classroomId}/export-all-groups")]
        public async Task<IActionResult> ExportAllGroups(int classroomId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new ExportAllGroupsQuery(userId.Value, classroomId);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpDelete("{classroomId}")]
        public async Task<IActionResult> DeleteClass(int classroomId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new DeleteClassCommand(classroomId, userId.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("{classroomId}/enrollment/remove-student")]
        public async Task<IActionResult> RemoveStudent([FromBody] RemoveStudentRequest request,int classroomId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var command = new RemoveStudentCommand(userId.Value,request.StudentId, classroomId);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
    }
}
