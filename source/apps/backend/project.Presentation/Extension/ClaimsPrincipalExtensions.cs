using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace project.Presentation.Extension
{
    public static class ClaimsPrincipalExtensions
    {
        public static int? GetUserId(this ClaimsPrincipal user)
        {
            var claim = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (claim == null) return null;
            return int.TryParse(claim, out var id) ? id : null;
        }
    }
}
