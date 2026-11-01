using project.Application.ModelsDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace project.Application.Interfaces
{
    public interface IGithubService
    {
        Task<int> GetTotalCommitAsync(string owner,string repo,string userName);
        Task<bool> IsValidRepositoryAsync(string owner, string repo);
        Task<string?> GetRepoOwnerAsync(string owner, string repo);
        Task<PullRequestModel?> GetPRByTaskIdAsync(string owner, string repo, int taskId);
        Task<bool> IsBranchExistAsync(string owner, string repo, int taskId);
        Task<BranchModel?> CreateBranchAsync(string owner, string repo, int taskId, string accessToken, string baseBranch = "main");
        Task<bool> DeleteBranchAsync(string owner, string repo, int taskId, string accessToken);
    }
    public class GitRefModel
    {
        [JsonPropertyName("ref")]
        public string Ref { get; set; }

        [JsonPropertyName("object")]
        public GitObjectModel Object { get; set; }
    }

    public class GitObjectModel
    {
        [JsonPropertyName("sha")]
        public string Sha { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; }
    }

    public class BranchModel
    {
        [JsonPropertyName("ref")]
        public string Ref { get; set; }

        [JsonPropertyName("url")]
        public string Url { get; set; }

        [JsonPropertyName("object")]
        public GitObjectModel Object { get; set; }
    }
}
