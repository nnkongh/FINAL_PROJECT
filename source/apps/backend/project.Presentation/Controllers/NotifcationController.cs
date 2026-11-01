using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using project.Application.Features.Command.Notifcations.ReadAllNotis;
using project.Application.Features.Command.Notifcations.ReadNotiById;
using project.Application.Features.Query.Notifications;
using project.Presentation.Extension;

namespace project.Presentation.Controllers
{
    [Authorize]
    [Route("api/notification")]
    public class NotifcationController : ApiController
    {
        public NotifcationController(ISender sender) : base(sender)
        {
        }

        [HttpGet]
        public async Task<IActionResult> GetNotification()
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new GetNotificationQuery(user.Value);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : Unauthorized(result.Error);
        }
        [HttpPut("{id}/read")]
        public async Task<IActionResult> ReadNotification(int id)
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new ReadNotificationCommand(id,user.Value);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : Unauthorized(result.Error);
        }
        [HttpPut("read-all")]
        public async Task<IActionResult> ReadAllNotification()
        {
            var user = User.GetUserId();
            if (user == null) return Unauthorized();
            var query = new ReadAllNotificationCommand(user.Value);
            var result = await _sender.Send(query);
            return result.IsSuccess ? Ok(result) : Unauthorized(result.Error);
        }
    }
}
