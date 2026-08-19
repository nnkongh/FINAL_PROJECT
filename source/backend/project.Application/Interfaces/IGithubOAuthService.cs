using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace project.Application.Interfaces
{
    public interface IGithubOAuthService
    {
        Task<string?> GetAccessTokenAsync(string code);
        Task<List<GithubEmailModel>> GetEmailAsync(string accessToken);
        Task<GithubUserModel> GetUserAsync(string accessToken);
    }
    public class GithubEmailModel
    {
        [JsonPropertyName("email")]
        public string Email { get; set; }
        [JsonPropertyName("verified")]
        public bool Verified {  get; set; }
        [JsonPropertyName("primary")]
        public bool Primary { get; set; }
    }
    public class GithubUserModel
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }
        [JsonPropertyName("login")]
        public string Login { get; set; }
    }
}
