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

namespace project.Application.Features.Command.User.ChangePassword
{
    public sealed class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, Result>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IUnitOfWork _unitOfWork;

        public ChangePasswordHandler(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IUserRepository userRepository)
        {
            _unitOfWork = unitOfWork;
            _passwordHasher = passwordHasher;
            _userRepository = userRepository;
        }

        public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.OldPassword)) return Result.Failure(new Error("400", "Mật khẩu cũ không được để trống"));
            if (string.IsNullOrEmpty(request.NewPassword)) return Result.Failure(new Error("400", "Mật khẩu mới không được để trống"));
            if (string.IsNullOrEmpty(request.ConfirmPassword)) return Result.Failure(new Error("400", "Nhập lại mật khẩu mới không được để trống"));
            if (!string.Equals(request.NewPassword, request.ConfirmPassword)) return Result.Failure(new Error("400", "Mật khẩu không trùng nhau"));

            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null) return Result.Failure(new Error("404", "Không tìm thấy người dùng"));

            var verifyPassword = _passwordHasher.Verify(request.OldPassword, user.PasswordHash);
            if (!verifyPassword) return Result.Failure(new Error("400", "Mật khẩu cũ không đúng"));

            var passwordHash = _passwordHasher.Hash(request.NewPassword);
            user.ChangePassword(passwordHash);

            await _unitOfWork.Repository<UserApp>().Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
