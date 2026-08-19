using Microsoft.Extensions.Options;
using project.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Services.FileStorage
{
    public class FileStorageService : IFileStorageService
    {
        private readonly string _storagePath;

        public FileStorageService(IOptions<FileStorageOptions> options)
        {
            _storagePath = options.Value.BasePath;
        }

        public bool FileExists(string filePath)
        {
            var folderPath = Path.Combine(_storagePath, filePath);
            if (!Directory.Exists(folderPath))
            {
                return false;
            }
            return true;
        }

        public async Task<byte[]> ReadFileAsync(string filePath)
        {
            var folderPath = Path.Combine(_storagePath, filePath);
            return await File.ReadAllBytesAsync(folderPath);
        }

        public async Task<string> SaveFileAsync(byte[] fileBytes, string fileName, string folder)
        {
            var folderPath = Path.Combine(_storagePath, folder);
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, fileName);
            await File.WriteAllBytesAsync(filePath, fileBytes);

            return Path.Combine(folder, fileName);
        }
    }
    public class FileStorageOptions
    {
        public const string SectionName = "FileStorage";
        public string BasePath { get; set; } = string.Empty;
    }
}
