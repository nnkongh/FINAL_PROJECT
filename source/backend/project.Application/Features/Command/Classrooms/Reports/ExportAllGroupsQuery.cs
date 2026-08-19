using MediatR;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Domain.Exceptions;
using project.Domain.Helpers;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Classrooms.Reports
{
    public sealed record ExportAllGroupsQuery(int RequestedBy, int ClassroomId) : IRequest<Result> { }

    public sealed class ExportAllGroupsHandler : IRequestHandler<ExportAllGroupsQuery, Result>
    {
        private readonly IGithubService _githubService;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IGroupRepository _groupRepistory;
        private readonly IReportRepository _reportRepository;
        private readonly IWorkTaskRepository _workTaskRepository;
        private readonly IFileStorageService _fileStorageService;
        private readonly IReportService _reportService;
        private readonly IUnitOfWork _unitOfWork;
        public ExportAllGroupsHandler(IReportService reportService, IClassroomRepository classRoomRepository, IUnitOfWork unitOfWork, IGithubService githubService, IFileStorageService fileStorageService, IReportRepository reportRepository, IWorkTaskRepository workTaskRepository, IGroupRepository groupRepistory)
        {
            _reportService = reportService;
            _classRoomRepository = classRoomRepository;
            _unitOfWork = unitOfWork;
            _githubService = githubService;
            _fileStorageService = fileStorageService;
            _reportRepository = reportRepository;
            _workTaskRepository = workTaskRepository;
            _groupRepistory = groupRepistory;
        }
        public async Task<Result> Handle(ExportAllGroupsQuery request, CancellationToken cancellationToken)
        {
            var classroom = await _classRoomRepository.GetByIdAsync(request.ClassroomId);
            if (classroom == null)
                return Result.Failure<ExportGroups>(new Error("404", "Không tìm thấy lớp"));
            if (classroom.TeacherId != request.RequestedBy)
                return Result.Failure<ExportGroups>(new Error("403", "Bạn không có quyền thực hiện chức năng này"));

            var groups = await _groupRepistory.GetGroupsWithTasksByIdClassIdAsync(request.ClassroomId);

            var exportResult = new ExportGroups { ClassName = classroom.ClassName };

            foreach (var g in groups)
            {

                var report = Report.Create(g.Id, classroom.TeacherId, $"Báo cáo nhóm {g.Name}");
                await _reportRepository.AddAsync(report);

                try
                {
                    report.StartGenerating();

                    GroupReportModel groupReportDto = classroom.MajorType == MajorType.General
                        ? await BuildGeneralReportAsync(g)
                        : await BuildITReportAsync(g);

                    var pdfBytes = await _reportService.ExportToPdfAsync(groupReportDto);
                    var fileName = $"Baocao_{g.Name}_{DateTime.UtcNow:yyyyMMdd_HHmm}.pdf";
                    var savePath = await _fileStorageService.SaveFileAsync(pdfBytes, fileName, "reports");

                    report.CompleteReport(savePath);
                    exportResult.Reports.Add(groupReportDto);
                }
                catch (DomainException ex)
                {
                    report.FailReport();
                    exportResult.FailedGroups.Add(new FailedGroupModel
                    {
                        GroupName = g.Name,
                        Reason = ex.Message
                    });
                }
                catch
                {
                    report.FailReport();
                    exportResult.FailedGroups.Add(new FailedGroupModel
                    {
                        GroupName = g.Name,
                        Reason = "Lỗi không xác định"
                    });
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
        private Task<GroupReportModel> BuildGeneralReportAsync(Groups g)
        {
            var totalGroupCompletedTasks = g.Members
                .SelectMany(m => m.User.AssignedTasks)
                .Count(t => t.Status == TasksStatus.Done);

            return Task.FromResult(new GroupReportModel
            {
                ExportedAt = DateTime.UtcNow,
                GroupName = g.Name,
                Members = g.Members.Select(m =>
                {
                    var memberCompleted = m.User.AssignedTasks.Count(t => t.Status == TasksStatus.Done);

                    return new MemberReportModel
                    {
                        Name = m.User.UserName,
                        TotalTasks = m.User.AssignedTasks.Count,
                        CompletedTasks = memberCompleted,
                        InProgressTasks = m.User.AssignedTasks.Count(t => t.Status == TasksStatus.InProgress),
                        TestTasks = m.User.AssignedTasks.Count(t => t.Status == TasksStatus.Test),
                        TodoTasks = m.User.AssignedTasks.Count(t => t.Status == TasksStatus.ToDo),
                        OverdueTasks = m.User.AssignedTasks.Count(t => t.IsOverdue()),
                        ContributionScore = totalGroupCompletedTasks > 0
                            ? Math.Round((double)memberCompleted / totalGroupCompletedTasks * 100, 2)
                            : 0
                    };
                }).ToList()
            });
        }

        private async Task<GroupReportModel> BuildITReportAsync(Groups g)
        {
            if (g.GithubRepoUrl == null)
                throw new DomainException("Nhóm chưa liên kết đến Github");

            var (owner, repo) = GithubUrlParser.Parse(g.GithubRepoUrl);

            var memberCommits = await Task.WhenAll(g.Members.Select(async m =>
            {
                var commitCount = m.User.GithubUserName != null
                    ? await _githubService.GetTotalCommitAsync(owner, repo, m.User.GithubUserName)
                    : 0;
                return (Member: m, CommitCount: commitCount);
            }));

            var totalGroupCompletedTasks = g.Members
                .SelectMany(m => m.User.AssignedTasks)
                .Count(t => t.Status == TasksStatus.Done);

            var totalGroupCommits = memberCommits.Sum(mc => mc.CommitCount);

            return new GroupReportModel
            {
                ExportedAt = DateTime.UtcNow,
                GroupName = g.Name,
                Members = memberCommits.Select(mc =>
                {
                    var memberCompleted = mc.Member.User.AssignedTasks.Count(t => t.Status == TasksStatus.Done);

                    var taskScore = totalGroupCompletedTasks > 0
                        ? (double)memberCompleted / totalGroupCompletedTasks * 100
                        : 0;
                    var commitScore = totalGroupCommits > 0
                        ? (double)mc.CommitCount / totalGroupCommits * 100
                        : 0;

                    return new MemberReportModel
                    {
                        Name = mc.Member.User.UserName,
                        TotalTasks = mc.Member.User.AssignedTasks.Count,
                        CompletedTasks = memberCompleted,
                        InProgressTasks = mc.Member.User.AssignedTasks.Count(t => t.Status == TasksStatus.InProgress),
                        TestTasks = mc.Member.User.AssignedTasks.Count(t => t.Status == TasksStatus.Test),
                        TodoTasks = mc.Member.User.AssignedTasks.Count(t => t.Status == TasksStatus.ToDo),
                        OverdueTasks = mc.Member.User.AssignedTasks.Count(t => t.IsOverdue()),
                        ContributionScore = Math.Round(taskScore * 0.5 + commitScore * 0.5, 2)
                    };
                }).ToList()
            };
        }
    }

}