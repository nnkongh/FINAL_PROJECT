using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Interfaces
{
    public interface IFileStorageService 
    {
        Task<string> SaveFileAsync(byte[] fileBytes, string fileName, string folder);
        Task<byte[]> ReadFileAsync(string filePath);
        bool FileExists(string filePath);
    }
}
