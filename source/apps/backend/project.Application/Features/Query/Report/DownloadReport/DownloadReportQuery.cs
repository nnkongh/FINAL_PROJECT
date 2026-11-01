using MediatR;
using project.Application.Interfaces;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Report.DownloadReport
{
    public sealed record DownloadReportQuery(int ReportId, int RequestedBy) : IRequest<Result<byte[]>>
    {
    }
    public sealed class DownloadReportHandler : IRequestHandler<DownloadReportQuery, Result<byte[]>>
    {
        private readonly IReportRepository _reportRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IFileStorageService _fileStorageService;
        public DownloadReportHandler(IFileStorageService fileStorageService, IGroupRepository groupRepository, IReportRepository reportRepository)
        {
            _fileStorageService = fileStorageService;
            _groupRepository = groupRepository;
            _reportRepository = reportRepository;
        }
        public async Task<Result<byte[]>> Handle(DownloadReportQuery request, CancellationToken cancellationToken)
        {
            var report = await _reportRepository.GetByIdAsync(request.ReportId);
            if (report == null)
                return Result.Failure<byte[]>(new Error("404", "Báo cáo không tồn tại"));

            if (report.Status != ReportType.Completed)
                return Result.Failure<byte[]>(new Error("400", "Báo cáo chưa hoàn thành"));

            var group = await _groupRepository.GetByIdWithMemberAsync(report.GroupId);
            if (group == null)
                return Result.Failure<byte[]>(new Error("404", "Nhóm không tồn tại"));

            var member = group.FindMember(request.RequestedBy);
            if (member == null || !member.IsActive)
                return Result.Failure<byte[]>(new Error("403", "Bạn không có quyền tải báo cáo này"));

            if (string.IsNullOrEmpty(report.FilePath) || !_fileStorageService.FileExists(report.FilePath))
                return Result.Failure<byte[]>(new Error("404", "File báo cáo không tồn tại trên server"));

            var fileBytes = await _fileStorageService.ReadFileAsync(report.FilePath);
            return Result.Success(fileBytes);
        }
    }
}