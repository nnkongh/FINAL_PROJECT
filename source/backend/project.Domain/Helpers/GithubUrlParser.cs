using project.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Domain.Helpers
{
    public class GithubUrlParser
    {
        public static bool TryParseGithubUrl(string url, out string owner, out string repo)
        {
            owner = repo = string.Empty;
            try
            {
                var uri = new Uri(url);
                if (uri.Host != "github.com") return false;
                var parts = uri.AbsolutePath.Trim('/').Split('/');
                if (parts.Length < 2) return false;
                owner = parts[0];
                repo = parts[1].Replace(".git", ""); ;
                return true;
            }
            catch
            {
                return false;
            }
        }
        public static (string owner, string repo) Parse(string url)
        {
            if (!TryParseGithubUrl(url, out var owner, out var repo))
            {
                throw new DomainException("URL GitHub không hợp lệ");
            }
            return (owner, repo);
        }
    }
}
