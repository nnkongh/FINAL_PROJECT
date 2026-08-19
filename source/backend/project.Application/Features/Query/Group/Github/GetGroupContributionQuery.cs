using AutoMapper;
using MediatR;
using project.Application.Interfaces;
using project.Domain.Helpers;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Group.Github
{
    public sealed record GetGroupCommitsQuery(int GroupId, int RequestedBy) : IRequest<Result<IReadOnlyList<MemberContributionModel>>>
    {
    }
    public sealed class GetGroupContributionHandler : IRequestHandler<GetGroupCommitsQuery, Result<IReadOnlyList<MemberContributionModel>>>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IGithubService _githubService;

        public GetGroupContributionHandler(IGithubService githubService, IGroupRepository groupRepository)
        {
            _githubService = githubService;
            _groupRepository = groupRepository;
        }

        public async Task<Result<IReadOnlyList<MemberContributionModel>>> Handle(GetGroupCommitsQuery request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
            if (group == null) return Result.Failure<IReadOnlyList<MemberContributionModel>>(new Error("404", "Không tìm thấy nhóm"));

            var member = group.FindMember(request.RequestedBy);
            if (member == null) return Result.Failure<IReadOnlyList<MemberContributionModel>>(new Error("403", "Bạn không phải thành viên của nhóm"));

            if (string.IsNullOrEmpty(group.GithubRepoUrl))
                return Result.Failure<IReadOnlyList<MemberContributionModel>>(new Error("400", "Nhóm chưa liên kết đến GitHub repo"));

            if(!GithubUrlParser.TryParseGithubUrl(group.GithubRepoUrl, out var owner, out var repo))
                return Result.Failure<IReadOnlyList<MemberContributionModel>>(new Error("400", "URL GitHub không hợp lệ"));
            
            var tasks = group.Members
            .Where(m => m.IsActive)
            .Select(async m =>
            {
                var totalCommits = 0;
                if(m.User.GithubUserName != null)
                {
                    totalCommits = await _githubService.GetTotalCommitAsync(m.User.GithubUserName!, repo, owner);
                }
                return new MemberContributionModel
                {
                    UserName = m.User.UserName,
                    GithubUserName = m.User.GithubUserName,
                    TotalCommit = totalCommits
                };
            });
            
            var result = await Task.WhenAll(tasks);
            return Result.Success<IReadOnlyList<MemberContributionModel>>(result.OrderByDescending(m => m.TotalCommit).ToList());
        }
    }

    public class MemberContributionModel
    {
        public string UserName { get; set; }
        public string? GithubUserName { get; set; }
        public int TotalCommit { get; set; }
        public double? TotalContribution { get; set; }
    }
}
