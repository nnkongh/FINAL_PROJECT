using ClosedXML.Excel;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Services.ExcelImport
{
    public class ExcelImportService : IExcelImportService
    {

        public List<ImportUserDto> ParseUser(byte[] fileBytes)
        {
            var result = new List<ImportUserDto>();

            using var stream = new MemoryStream(fileBytes);
            using var workbook = new XLWorkbook(stream);

            var sheet = workbook.Worksheet(1);
            var rows = sheet.RangeUsed().RowsUsed().Skip(1); // Bỏ header

            foreach(var row in rows)
            {
                var userCode = row.Cell(1).GetString().Trim();
                var userName = row.Cell(2).GetString().Trim();
                var email = row.Cell(3).GetString().Trim();
                var role = row.Cell(4).GetString().Trim();

                if (string.IsNullOrWhiteSpace(email)) continue;

                result.Add(new ImportUserDto
                {
                    UserCode = userCode,
                    UserName = userName,
                    Email = email,
                    Role = role
                });
            }
            return result;
        }

    }
}
