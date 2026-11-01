using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Report.GetReports
{
    public sealed record GetReportsQuery(int RequestedBy, int GroupId) : IRequest<Result<IReadOnlyList<ReportModel>>>
    {
    }
    public sealed class GetReportsQueryHandler : IRequestHandler<GetReportsQuery, Result<IReadOnlyList<ReportModel>>>
    {
        private readonly IReportRepository _reportRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IMapper _mapper;
        public GetReportsQueryHandler(IReportRepository reportRepository, IGroupRepository groupRepository, IMapper mapper)
        {
            _reportRepository = reportRepository;
            _groupRepository = groupRepository;
            _mapper = mapper;
        }
        public async Task<Result<IReadOnlyList<ReportModel>>> Handle(GetReportsQuery request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdAsync(request.GroupId);
            if (group == null) return Result.Failure<IReadOnlyList<ReportModel>>(new Error("404", "Nhóm không tồn tại"));
            if (!group.IsActive) return Result.Failure<IReadOnlyList<ReportModel>>(new Error("403", "Nhóm đã bị vô hiệu hóa"));

            var member = group.FindMember(request.RequestedBy);
            if (member == null || !member.IsActive) return Result.Failure<IReadOnlyList<ReportModel>>(new Error("403", "Bạn không phải là thành viên của nhóm này"));

            var reports = await _reportRepository.GetReportsByGroupIdAsync(request.GroupId);
            if (reports == null || !reports.Any()) return Result.Failure<IReadOnlyList<ReportModel>>(new Error("404", "Không tìm thấy báo cáo nào trong nhóm này"));

            IReadOnlyList<ReportModel> dto = reports.Select(r => new ReportModel
            {
                Id = r.Id,
                Title = r.Title,
                CreatedAt = r.CreatedAt,
                GeneratedBy = r.GeneratedBy,
                Status = r.Status,
                GroupId = r.GroupId,
            }).ToList();

            return Result.Success(dto);
        }
    }
}