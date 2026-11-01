using MediatR;
using project.Domain.Shared;

namespace project.Application.Features.Command.Reports.ExportGroupPdf
{
    public sealed record ExportGroupReportCommand(int RequestedBy, int GroupId) : IRequest<Result<byte[]>>
    {
    }
    public record ExportReportResult(byte[] Content, string ContentType, string FileName);

}
