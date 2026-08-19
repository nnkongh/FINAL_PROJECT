using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace project.Application.ModelsDto
{
    public class PullRequestModel
    {
        [JsonPropertyName("number")]
        public int Number { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("html_url")]
        public string HtmlUrl { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }  
        [JsonPropertyName("commits")]
        public int Commits { get; set; }
        [JsonPropertyName("user")]
        public PRAuthorModel User { get; set; }
        [JsonPropertyName("head")]
        public PRHeadModel Head { get; set; }
        [JsonPropertyName("merged")]
        public bool Merged { get; set; }
    }
    public class PRAuthorModel
    {
        [JsonPropertyName("login")]
        public string Login { get; set; }

        [JsonPropertyName("avatar_url")]
        public string AvatarUrl { get; set; }

        [JsonPropertyName("html_url")]
        public string HtmlUrl { get; set; }
    }
    public class PRHeadModel
    {
        [JsonPropertyName("ref")]
        public string Ref { get; set; }
    }

}
