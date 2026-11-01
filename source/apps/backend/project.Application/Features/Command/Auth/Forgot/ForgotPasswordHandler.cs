using MediatR;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Auth.Forgot
{
    public class ForgotPasswordHandler : IRequestHandler<ForgotPasswordCommand,Result>
    {
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly ITokenGenerator _tokenGenerator;
        private readonly IUnitOfWork _unitOfWork;
        public ForgotPasswordHandler(IUserRepository userRepository, IEmailService emailService, ITokenGenerator tokenGenerator, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _emailService = emailService;
            _tokenGenerator = tokenGenerator;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.email)) return Result.Failure(new Error("404", "Email không được để trống"));
            if (string.IsNullOrEmpty(request.clientUri)) return Result.Failure(new Error("404", "ClientUri không được để trống"));

            var user = await _userRepository.FindByEmailAsync(request.email);
            if (user == null) return Result.Failure(new Error("404", $"Không tìm thấy người dùng với email {request.email}"));

            user.ClearResetPasswordToken();

            var token = _tokenGenerator.GenerateResetPasswordToken();
            var expiry = DateTime.UtcNow.AddMinutes(15);

            user.SetResetPasswordToken(token, expiry);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var resetLink = $"{request.clientUri}?token={Uri.EscapeDataString(token)}";
            var body = $"Nhấn vào link để đặt lại mật khẩu: <a href='{resetLink}'>Đặt lại mật khẩu</a><br/>Link hết hạn sau 15 phút.";
            var message = new Message([user.Email], "Đặt lại mật khẩu", body);
            await _emailService.SendEmail(message);
            return Result.Success();


        }
    }
}
