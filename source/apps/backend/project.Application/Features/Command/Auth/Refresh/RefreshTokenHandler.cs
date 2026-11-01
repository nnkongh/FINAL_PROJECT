using MediatR;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Auth.Refresh
{
    public sealed class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, Result<TokenModel>>
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenGenerator _tokenService;
        private readonly IUnitOfWork _unitOfWork;
        public RefreshTokenHandler(ITokenGenerator tokenService, IUserRepository userRepository, IUnitOfWork unitOfWork)
        {
            _tokenService = tokenService;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<TokenModel>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.RefreshToken)) return Result.Failure<TokenModel>(new Error("400", "Refresh token bị trống"));
            if (string.IsNullOrEmpty(request.AccessToken)) return Result.Failure<TokenModel>(new Error("400", "Access token bị trống"));

            var userId = _tokenService.GetUserIdFromExpiredToken(request.AccessToken);
            if(userId == null) return Result.Failure<TokenModel>(new Error("404", "Access token không hợp lệ"));

            var user = await _userRepository.GetByIdAsync(userId.Value);
            if (user == null) return Result.Failure<TokenModel>(new Error("404", "Không tìm thấy người dùng"));

            if (user.RefreshToken != request.RefreshToken) return Result.Failure<TokenModel>(new Error("401", "Token không hợp lệ"));

            if (user.RefreshTokenExpiryTime <= DateTime.UtcNow) return Result.Failure<TokenModel>(new Error("401", "Refresh token đã hết hạn"));

            var newToken = await _tokenService.CreateToken(user, populateExp: true);
            user.RefreshToken = newToken.RefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            _unitOfWork.Repository<UserApp>();
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success<TokenModel>(newToken);
        }
    }
}
