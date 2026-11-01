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
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Reports.ExportGroupPdf
{
    public sealed class ExportGroupReportHandler : IRequestHandler<ExportGroupReportCommand, Result<byte[]>>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IGithubService _githubService;
        private readonly IReportRepository _reportRepository;
        private readonly IFileStorageService _fileStorageService;
        private readonly IReportService _reportService;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUnitOfWork _unitOfWork;
        public ExportGroupReportHandler(IGroupRepository groupRepository, IUnitOfWork unitOfWork, IReportRepository reportRepository, IReportService reportService, IFileStorageService fileStorageService, IGithubService githubService, IClassroomRepository classRoomRepository)
        {
            _groupRepository = groupRepository;
            _unitOfWork = unitOfWork;
            _reportRepository = reportRepository;
            _reportService = reportService;
            _fileStorageService = fileStorageService;
            _githubService = githubService;
            _classRoomRepository = classRoomRepository;
        }
        public async Task<Result<byte[]>> Handle(ExportGroupReportCommand request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdWithTaskMemberAsync(request.GroupId);
            if (group == null) return Result.Failure<byte[]>(new Error("404", "Nhóm không tồn tại"));
            if (!group.IsActive) return Result.Failure<byte[]>(new Error("403", "Nhóm đã bị vô hiệu hóa"));

            var classRoom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
            if (classRoom == null) return Result.Failure<byte[]>(new Error("404", "Không tìm thấy lớp học"));
            if (!classRoom.IsActive) return Result.Failure<byte[]>(new Error("403", "Không thể thêm bình luận vào lớp học bị vô hiệu hóa"));

            if (classRoom.TeacherId != request.RequestedBy)
            {
                var member = group.FindMember(request.RequestedBy);
                if (member == null || !member.IsActive) return Result.Failure<byte[]>(new Error("403", "Bạn không có quyền truy cập báo cáo này"));
            }

            var report = Report.Create(group.Id, request.RequestedBy, $"Báo cáo nhóm {group.Name} - {DateTime.UtcNow:dd/MM/yyyy}");
            await _reportRepository.AddAsync(report);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            try
            {
                report.StartGenerating();
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                GroupReportModel reportDto;

                var activeMembers = group.Members.Where(m => m.IsActive).ToList();

                var totalGroupCompletedTasks = activeMembers.Sum(m => m.Contribution);

                if (group.MajorType == MajorType.General)
                {
                    reportDto = new GroupReportModel
                    {
                        GroupName = group.Name,
                        ExportedAt = DateTime.UtcNow,
                        Members = activeMembers.Select(m =>
                        {
                            var groupTasks = m.User.AssignedTasks.Where(t => t.GroupId == group.Id).ToList();

                            return new MemberReportModel
                            {
                                Name = m.User.UserName,
                                TotalTasks = groupTasks.Count,
                                CompletedTasks = m.Contribution,
                                InProgressTasks = groupTasks.Count(t => t.Status == TasksStatus.InProgress),
                                TestTasks = groupTasks.Count(t => t.Status == TasksStatus.Test),
                                TodoTasks = groupTasks.Count(t => t.Status == TasksStatus.ToDo),
                                OverdueTasks = groupTasks.Count(t => t.IsOverdue()),
                                ContributionScore = totalGroupCompletedTasks > 0
                                    ? Math.Round((double)m.Contribution / totalGroupCompletedTasks * 100, 2)
                                    : 0
                            };
                        }).ToList()
                    };
                }
                else
                {
                    if (group.GithubRepoUrl == null)
                        return Result.Failure<byte[]>(new Error("403", "Nhóm chưa liên kết đến github"));

                    var (owner, repo) = GithubUrlParser.Parse(group.GithubRepoUrl);

                    var memberCommits = await Task.WhenAll(activeMembers.Select(async m =>
                    {
                        var commit = m.User.GithubUserName != null
                            ? await _githubService.GetTotalCommitAsync(owner, repo, m.User.GithubUserName!)
                            : 0;
                        return (Member: m, CommitCount: commit);
                    }));

                    var totalGroupCommits = memberCommits.Sum(mc => mc.CommitCount);

                    reportDto = new GroupReportModel
                    {
                        GroupName = group.Name,
                        ExportedAt = DateTime.UtcNow,
                        Members = memberCommits.Select(mc =>
                        {
                            var groupTasks = mc.Member.User.AssignedTasks
                                            .Where(t => t.GroupId == group.Id) 
                                            .ToList();

                            var taskScore = totalGroupCompletedTasks > 0
                                ? (double)mc.Member.Contribution / totalGroupCompletedTasks * 100 : 0;
                            var commitScore = totalGroupCommits > 0
                                ? (double)mc.CommitCount / totalGroupCommits * 100 : 0;

                            return new MemberReportModel
                            {
                                Name = mc.Member.User.UserName,
                                TotalTasks = groupTasks.Count,
                                CompletedTasks = mc.Member.Contribution,
                                InProgressTasks = groupTasks.Count(t => t.Status == TasksStatus.InProgress),
                                TestTasks = groupTasks.Count(t => t.Status == TasksStatus.Test),
                                TodoTasks = groupTasks.Count(t => t.Status == TasksStatus.ToDo),
                                OverdueTasks = groupTasks.Count(t => t.IsOverdue()),
                                ContributionScore = Math.Round(taskScore * 0.6 + commitScore * 0.4, 2)
                            };
                        }).ToList()
                    };
                }

                var pdfBytes = await _reportService.ExportToPdfAsync(reportDto);
                var fileName = $"Baocao_{group.Name}_{DateTime.UtcNow:yyyyMMdd_HHmm}.pdf";

                var savePath = await _fileStorageService.SaveFileAsync(pdfBytes, fileName, "reports");

                report.CompleteReport(savePath);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result.Success(pdfBytes);
            }
            catch
            {
                report.FailReport();
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return Result.Failure<byte[]>(new Error("400", "Export thất bại"));
            }
        }
    }
}
