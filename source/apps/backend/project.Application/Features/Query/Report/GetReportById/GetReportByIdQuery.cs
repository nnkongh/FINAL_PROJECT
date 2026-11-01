using MediatR;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Report.GetReportById
{
    public sealed record GetReportByIdQuery(int RequestedBy, int ReportId) : IRequest<Result<ReportModel>>
    {
    }
    public sealed class GetReportByIdHandler : IRequestHandler<GetReportByIdQuery, Result<ReportModel>>
    {
        private readonly IReportRepository _reportRepository;
        private readonly IGroupRepository _groupRepository;
        public GetReportByIdHandler(IReportRepository reportRepository, IGroupRepository groupRepository)
        {
            _reportRepository = reportRepository;
            _groupRepository = groupRepository;
        }
        public async Task<Result<ReportModel>> Handle(GetReportByIdQuery request, CancellationToken cancellationToken)
        {

            var report = await _reportRepository.GetByIdAsync(request.ReportId);
            if (report == null) return Result.Failure<ReportModel>(new Error("404", "Báo cáo không tồn tại"));

            var group = await _groupRepository.GetByIdWithMemberAsync(report.GroupId);
            if (group == null) return Result.Failure<ReportModel>(new Error("404", "Nhóm không tồn tại"));
            if (!group.IsActive) return Result.Failure<ReportModel>(new Error("403", "Nhóm đã bị vô hiệu hóa"));

            var member = group.FindMember(request.RequestedBy);
            if (member == null || !member.IsActive) return Result.Failure<ReportModel>(new Error("403", "Bạn không phải là thành viên của nhóm này"));

            var reportModel = new ReportModel
            {
                Id = report.Id,
                Title = report.Title,
                Status = report.Status,
                GeneratedBy = report.GeneratedBy,
                GroupId = report.GroupId,
                CreatedAt = report.CreatedAt
            };

            return Result.Success(reportModel);
        }
    }
}
