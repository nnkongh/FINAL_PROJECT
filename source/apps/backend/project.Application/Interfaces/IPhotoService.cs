using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Interfaces
{
    public interface IPhotoService
    {
        Task<string> AddPhotoAsync(byte[] FileBytes, string FileName, string ContentType);
        Task DeletePhotoAsync(string avatarUrl);
    }
}
