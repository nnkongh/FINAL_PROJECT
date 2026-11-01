using project.Application.ModelsDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Interfaces
{
    public interface IExcelImportService
    {
        List<ImportUserDto> ParseUser(byte[] fileBytes);
    }
}
