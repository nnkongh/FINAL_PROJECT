using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using project.Application.Features.Command.Comments.Create;
using project.Application.Features.Command.Comments.Delete;
using project.Application.Features.Command.Comments.Update;
using project.Application.Features.Query.Comments;
using project.Presentation.Extension;
using project.Presentation.Models;

namespace project.Presentation.Controllers
{
    [Route("api")]
    [Authorize]
    public class CommentController : ApiController
    {
        public CommentController(ISender sender) : base(sender)
        {
        }

        [HttpPost("task/{taskId}/comment")]
        public async Task<IActionResult> CreateComment(int taskId, CreateCommentRequest request)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new CreateCommentCommand(taskId, request.Content, user.Value, request.ParentCommentId);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpDelete("comment/{commentId}")]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new DeleteCommentCommand(commentId,user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpPut("comment/{commentId}")]
        public async Task<IActionResult> UpdateComment(int commentId, UpdateCommentRequest request)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var command = new UpdateCommentCommand(commentId, request.Content,user.Value);
            var result = await _sender.Send(command);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
        [HttpGet("task/{taskId}/comments")]
        public async Task<IActionResult> GetComments(int taskId)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetCommentsQuery(taskId);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
        }
    }
}
