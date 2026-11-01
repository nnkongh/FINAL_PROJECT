using Microsoft.Extensions.Configuration;
using project.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace project.Infrastructure.Services.GithubService
{
    public class GithubOauthService : IGithubOAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public GithubOauthService(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<string?> GetAccessTokenAsync(string code)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "https://github.com/login/oauth/access_token");
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Content = JsonContent.Create(new
            {
                client_id = _configuration["Github:GithubClientId"],
                client_secret = _configuration["Github:GithubClientSecret"],
                code,
                redirect_uri = _configuration["Github:RedirectUri"]
            }); 

            var response = await _httpClient.SendAsync(request);
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();

            return json.TryGetProperty("access_token", out var token)
                ? token.ToString()
                : null;
        }

        public async Task<List<GithubEmailModel>> GetEmailAsync(string accessToken)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user/emails");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.Add("User-Agent", _configuration["App:Name"]);

            var response = await _httpClient.SendAsync(request);
            return await response.Content.ReadFromJsonAsync<List<GithubEmailModel>>() ?? [];

        }

        public async Task<GithubUserModel> GetUserAsync(string accessToken)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.Add("User-Agent", _configuration["App:Name"]);

            var response = await _httpClient.SendAsync(request);
            return await response.Content.ReadFromJsonAsync<GithubUserModel>() ?? throw new Exception("Cannot get Github user");
        }

    }
}
