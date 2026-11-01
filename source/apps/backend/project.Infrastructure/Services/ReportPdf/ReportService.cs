using project.Application.Interfaces;
using project.Application.ModelsDto;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IContainer = QuestPDF.Infrastructure.IContainer;

namespace project.Infrastructure.Services.ReportPdf
{
    public class ReportService : IReportService
    {
        public async Task<byte[]> ExportToPdfAsync(GroupReportModel report)
        {
            QuestPDF.Settings.License = LicenseType.Community;
            var document = Document.Create(container =>
            {
                container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontFamily("Arial").FontSize(11));

                // ── HEADER ──
                page.Header().Column(col =>
                {
                    col.Item().Text($"BÁO CÁO LÀM VIỆC NHÓM")
                        .FontSize(18).Bold().AlignCenter();
                    col.Item().Text($"Nhóm: {report.GroupName}")
                        .FontSize(13).AlignCenter();
                    col.Item().PaddingTop(4)
                        .Text($"Ngày xuất: {report.ExportedAt:dd/MM/yyyy HH:mm}")
                        .FontSize(10).AlignCenter().FontColor("#6B7280");
                    col.Item().PaddingTop(8).LineHorizontal(1).LineColor("#E5E7EB");
                });

                // ── CONTENT ──
                page.Content().PaddingTop(16).Column(col =>
                {
                    // Tổng quan
                    col.Item().Text("Tổng quan").FontSize(13).Bold();
                    col.Item().PaddingTop(6).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(3);
                            c.RelativeColumn(1);
                            c.RelativeColumn(1);
                            c.RelativeColumn(1);
                            c.RelativeColumn(1);
                            c.RelativeColumn(1);
                            c.RelativeColumn(1);
                            c.RelativeColumn(1);
                        });

                        // Header row
                        static IContainer HeaderCell(IContainer c) => c
                            .Background("#1E3A5F")
                            .Padding(6);

                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderCell)
                                .Text("Họ và tên").FontColor("#FFFFFF").Bold();
                            header.Cell().Element(HeaderCell)
                                .Text("Tổng task").FontColor("#FFFFFF").Bold().AlignCenter();
                            header.Cell().Element(HeaderCell)
                                .Text("Todo").FontColor("#FFFFFF").Bold().AlignCenter();
                            header.Cell().Element(HeaderCell)
                                .Text("Đang làm").FontColor("#FFFFFF").Bold().AlignCenter();
                            header.Cell().Element(HeaderCell)
                                .Text("Task test").FontColor("#FFFFFF").Bold().AlignCenter();
                            header.Cell().Element(HeaderCell)
                                .Text("Hoàn thành").FontColor("#FFFFFF").Bold().AlignCenter();
                            header.Cell().Element(HeaderCell)
                                .Text("Task quá hạn").FontColor("#FFFFFF").Bold().AlignCenter();
                            header.Cell().Element(HeaderCell)
                                .Text("Điểm đóng góp").FontColor("#FFFFFF").Bold().AlignCenter();
                        });

                        // Data rows
                        foreach (var (member, index) in report.Members.Select((m, i) => (m, i)))
                        {
                            var bgColor = index % 2 == 0 ? "#FFFFFF" : "#F3F4F6";

                            IContainer DataCell(IContainer c) => c
                                .Background(bgColor).Padding(6);

                            table.Cell().Element(DataCell).Text(member.Name);
                            table.Cell().Element(DataCell).Text(member.TotalTasks.ToString()).AlignCenter();
                            table.Cell().Element(DataCell).Text(member.TodoTasks.ToString()).AlignCenter();
                            table.Cell().Element(DataCell).Text(member.InProgressTasks.ToString()).AlignCenter();
                            table.Cell().Element(DataCell).Text(member.TestTasks.ToString()).AlignCenter();
                            table.Cell().Element(DataCell).Text(member.CompletedTasks.ToString()).AlignCenter();
                            table.Cell().Element(DataCell).Text(member.OverdueTasks.ToString()).AlignCenter();

                            // Tỉ lệ có màu theo mức độ
                            var rateColor = member.ContributionScore >= 80 ? "#16A34A"
                                : member.ContributionScore >= 50 ? "#D97706"
                                : "#DC2626";

                            table.Cell().Element(DataCell)
                                .Text($"{member.ContributionScore}%")
                                .FontColor(rateColor).Bold().AlignCenter();
                        }
                    });

                    // Tổng cộng
                    col.Item().PaddingTop(12).Row(row =>
                    {
                        row.RelativeItem().Text(
                            $"Tổng số thành viên: {report.Members.Count}  |  " +
                            $"Tổng task: {report.Members.Sum(m => m.TotalTasks)}  |  " +
                            $"Hoàn thành: {report.Members.Sum(m => m.CompletedTasks)}"
                        ).FontSize(10).FontColor("#374151");
                    });
                });

                // ── FOOTER ──
                page.Footer().AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Trang ").FontSize(9).FontColor("#9CA3AF");
                        x.CurrentPageNumber().FontSize(9).FontColor("#9CA3AF");
                        x.Span(" / ").FontSize(9).FontColor("#9CA3AF");
                        x.TotalPages().FontSize(9).FontColor("#9CA3AF");
                    });
            });
            });

            var pdf = await Task.Run(() => document.GeneratePdf());
            return pdf;
        }
    }
}
