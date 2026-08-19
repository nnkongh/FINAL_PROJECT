using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using project.Application.Features.Command.Github;
using project.Application.Features.Query.Group.Github;
using project.Presentation.Extension;
using project.Presentation.Models.Auth;

namespace project.Presentation.Controllers
{
    [Route("api/auth/github")]
    public class GithubAuthController : ApiController
    {
        public GithubAuthController(ISender sender) : base(sender)
        {
        }

        [HttpPost("link")]
        [Authorize]
        public async Task<IActionResult> GetLinkUrl([FromBody]LinkGithubRequest request)
        {
            var user = User.GetUserId();
            var url = await _sender.Send(new GetGithubAuthUrlQuery(request.email, user!.Value));
            return Ok(new {redirectUrl = url});
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state)
        {
            var result = await _sender.Send(new LinkGithuhCommand(code, state));
            var errorMessage = Uri.EscapeDataString(result.Error ?? "error");
            return result.Success ? Redirect($"{result.ClientUrl}/profile?github=success") : Redirect($"{result.ClientUrl}/settings?github={errorMessage}");

        }
    }
}
