using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Group.Github
{
    public sealed record GetGithubAuthUrlQuery(string Email, int UserId) : IRequest<string>
    {
    }
    public sealed class GetGithubAuthUrlHander : IRequestHandler<GetGithubAuthUrlQuery, string>
    {
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _cache;

        public GetGithubAuthUrlHander(IMemoryCache cache, IConfiguration configuration)
        {
            _cache = cache;
            _configuration = configuration;
        }

        public Task<string> Handle(GetGithubAuthUrlQuery request, CancellationToken cancellationToken)
        {
            var state = Convert.ToBase64String(JsonSerializer.SerializeToUtf8Bytes(new
            {
                request.UserId,
                request.Email,
                nonce = Guid.NewGuid().ToString(),
            }));

            _cache.Set($"github_state_{state}", true, TimeSpan.FromMinutes(10));

            var clientId = _configuration["Github:GithubClientId"];
            var redirectUri = _configuration["Github:RedirectUri"];
            var url = $"https://github.com/login/oauth/authorize" +
                      $"?client_id={clientId}" + 
                      $"&redirect_uri={Uri.EscapeDataString(redirectUri!)}" +
                      $"&scope=user:email,repo" +
                      $"&state={Uri.EscapeDataString(state)}";

            return Task.FromResult(url);
        }
    }
}
