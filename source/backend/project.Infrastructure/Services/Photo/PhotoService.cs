using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using project.Application.Interfaces;
using project.Infrastructure.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Services.Photo
{
    public class PhotoService : IPhotoService
    {
        private readonly Cloudinary _cloudinary;

        public PhotoService(IOptions<CloudinarySettings> config)
        {
            var acc = new Account(config.Value.CloudName, config.Value.ApiKey, config.Value.ApiSecret);
            _cloudinary = new Cloudinary(acc);
        }

        public async Task<string> AddPhotoAsync(byte[] FileBytes, string FileName, string ContentType)
        {
            var uploadResult = new ImageUploadResult();
            if (FileBytes.Length > 0)
            {
                using var stream = new MemoryStream(FileBytes);
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(FileName, stream),
                    Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face")
                };
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if(uploadResult.Error != null)
                {
                    return uploadResult.Error.Message;
                }
            }
            return uploadResult.SecureUrl.ToString();
        }
        public async Task DeletePhotoAsync(string avatarUrl)
        {
            var deleteParams = new DeletionParams(avatarUrl);
            var result = await _cloudinary.DestroyAsync(deleteParams);
        }
    }
}
