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

namespace project.Application.Features.Command.Auth.Reset
{
    public class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, Result>
    {
        private readonly IPasswordHasher _passwordHasher;
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        public ResetPasswordHandler(IPasswordHasher passwordHasher, IUserRepository userRepository, IUnitOfWork unitOfWork)
        {
            _passwordHasher = passwordHasher;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.token)) return Result.Failure(new Error("400", "Token reset đang trống"));
            if (string.IsNullOrEmpty(request.email)) return Result.Failure(new Error("400", "Email đang trống"));
            if (string.IsNullOrEmpty(request.passwordConfirm) || string.IsNullOrEmpty(request.newPassword)) return Result.Failure(new Error("400", "Mật khẩu đang trống"));
            if (!string.Equals(request.newPassword, request.passwordConfirm)) return Result.Failure(new Error("400", "Mật khẩu không trùng nhau"));
            if (request.newPassword.Length < 8) return Result.Failure(new Error("400", "Mật khẩu phải có ít nhất 8 ký tự"));

            var user = await _userRepository.FindByEmailAsync(request.email);
            if (user == null) return Result.Failure(new Error("404", "Không tìm thấy người dùng"));

            if (!user.IsResetTokenValid(request.token)) return Result.Failure(new Error("400", "Token không hợp lệ hoặc hết hạn"));

            var newHash = _passwordHasher.Hash(request.newPassword);
            user.ChangePassword(newHash);
            user.ClearResetPasswordToken();

            _unitOfWork.Repository<UserApp>();
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();

        }
    }
}
