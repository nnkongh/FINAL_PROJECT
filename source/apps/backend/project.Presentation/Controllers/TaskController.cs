using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using project.Application.Features.Command.WorkTasks.AISupport;
using project.Application.Features.Command.WorkTasks.Assign;
using project.Application.Features.Command.WorkTasks.Complete;
using project.Application.Features.Command.WorkTasks.Create;
using project.Application.Features.Command.WorkTasks.Delete;
using project.Application.Features.Command.WorkTasks.Reject;
using project.Application.Features.Command.WorkTasks.SetDueDate;
using project.Application.Features.Command.WorkTasks.Start;
using project.Application.Features.Command.WorkTasks.Test;
using project.Application.Features.Command.WorkTasks.Update;
using project.Application.Features.Query.WorkTask.GetAllMyTasksQuery;
using project.Application.Features.Query.WorkTask.GetById;
using project.Application.Features.Query.WorkTask.GetTaskDetail;
using project.Application.Features.Query.WorkTask.GetTaskHistoryById;
using project.Application.Features.Query.WorkTask.GetTasks;
using project.Application.Features.Query.WorkTask.GetTasksOverdue;
using project.Domain.Models;
using project.Presentation.Extension;
using project.Presentation.Models;

namespace project.Presentation.Controllers
{
    [Route("api")]
    [Authorize]
    public class TaskController : ApiController
    {
        public TaskController(ISender sender) : base(sender)
        {
        }
        [HttpGet("group/{groupId}/tasks")]
        public async Task<IActionResult> GetTasks(int groupId, [FromQuery] int? labelId, [FromQuery] TasksStatus? taskStatus, [FromQuery] TaskPriority? taskPriority)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetTasksInGroupQuery(groupId, user.Value, labelId, taskStatus, taskPriority);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("group/{groupId}/my-task")]
        public async Task<IActionResult> GetMyTasks(int groupId, [FromQuery] int? labelId, [FromQuery] TasksStatus? taskStatus, [FromQuery] TaskPriority? taskPriority)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetTasksByUserIdQuery(groupId, labelId, user.Value, taskStatus, taskPriority);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPost("group/{groupId}/tasks")]
        public async Task<IActionResult> CreateTask(int groupId, [FromBody] CreateTaskRequest request)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new CreateTaskCommand(groupId, request.Title, user.Value, request.TaskStatus, request.Priority, user.Value, request.AssignedTo, request.DueDate, request.Description);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("task/{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskRequest request)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new UpdateTaskCommand(id, request.Title, request.Description, request.Priority, request.TaskStatus, user.Value, request.DueDate, request.AssignedTo);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpDelete("task/{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new DeleteTaskCommand(id, user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("task/{id}/assign")]
        public async Task<IActionResult> AssignTask(int id, [FromBody] AssignTaskRequest request)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new AssignTaskCommand(id, request.AssignedTo, user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("task/{id}/start")]
        public async Task<IActionResult> StartTask(int id)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new StartTaskCommand(id, user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("task/{id}/complete")]
        public async Task<IActionResult> CompleteTask(int id)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new CompleteTaskCommand(id, user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("task/{id}/due-date")]
        public async Task<IActionResult> SetDueDate(int id, [FromBody] SetDueDateRequest request, CancellationToken cancellationToken)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new SetDueDateCommand(id, request.DateTime, user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("task/{taskId}/test")]
        public async Task<IActionResult> Test(int taskId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new TestTaskCommand(taskId, user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("task/{taskId}/reject")]
        public async Task<IActionResult> Reject(int taskId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new RejectTaskCommand(taskId, user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetTaskById(int taskId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetTaskDetailQuery(taskId, user.Value);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("task/{taskId}/history")]
        public async Task<IActionResult> GetTaskHistoryById(int taskId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetTaskWithHistoryQuery(taskId, user.Value);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("group/{groupId}/tasks/overdue")]
        public async Task<IActionResult> GetOverdueTasks(int groupId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetTasksOverdueQuery(user.Value, groupId);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("task/all-my-task")]
        public async Task<IActionResult> GetAllMyTasks()
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetAllMyTasksQuery(user.Value);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
    }
}
