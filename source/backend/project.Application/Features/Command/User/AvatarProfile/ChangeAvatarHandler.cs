using MediatR;
using project.Application.Interfaces;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.User.AvatarProfile
{
    public sealed class ChangeAvatarHandler : IRequestHandler<ChangeAvatarCommand, Result<string>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPhotoService _photoService;

        public ChangeAvatarHandler(IPhotoService photoService, IUnitOfWork unitOfWork, IUserRepository userRepository)
        {
            _photoService = photoService;
            _unitOfWork = unitOfWork;
            _userRepository = userRepository;
        }

        public async Task<Result<string>> Handle(ChangeAvatarCommand request, CancellationToken cancellationToken)
        {
            if (request.FileBytes.Length == 0 || request.FileBytes == null) return Result.Failure<string>(new Error("400", "File không được để trống"));
            if (string.IsNullOrEmpty(request.FileName)) return Result.Failure<string>(new Error("400", "Tên file không được để trống"));
            if (string.IsNullOrEmpty(request.ContentType)) return Result.Failure<string>(new Error("400", "Content type không được để trống"));

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/jpg" };
            if (!allowedTypes.Contains(request.ContentType)) return Result.Failure<string>(new Error("400", "Chỉ nhận định dạng jpg, png, jpeg"));

            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null) return Result.Failure<string>(new Error("404", "Không tìm thấy người dùng"));

            var url = await _photoService.AddPhotoAsync(request.FileBytes, request.FileName, request.ContentType);
            if (url == null) return Result.Failure<string>(new Error("400", "Xảy ra lỗi khi xử lý ảnh"));

            user.UpdateAvatarProfile(url);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(url);

        }
    }
}
