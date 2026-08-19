using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using project.Application.Features.Command.WorkTasks.AISupport;
using project.Presentation.Extension;
using project.Presentation.Models;

namespace project.Presentation.Controllers
{
    [Authorize]
    [Route("api/ai")] 
    public class AiController : ApiController
    {
        public AiController(ISender sender) : base(sender)
        {
        }

        [HttpPost("support")]
        public async Task<IActionResult> Support([FromBody] AISuportCommand command)
        {
            var result = await _sender.Send(command);

            if (result.IsFailure)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }
    }
}
