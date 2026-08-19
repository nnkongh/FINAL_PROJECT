using AutoMapper;
using MediatR;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Application.ModelsDto.DomainModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Auth.Login
{
    public sealed class LoginHandler : IRequestHandler<LoginCommand, Result<TokenModel>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenGenerator _tokenGenerator;
        private readonly IUnitOfWork _unitOfWork;
        public LoginHandler(ITokenGenerator tokenGenerator, IPasswordHasher passwordHasher, IUserRepository userRepository, IUnitOfWork unitOfWork)
        {
            _tokenGenerator = tokenGenerator;
            _passwordHasher = passwordHasher;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<TokenModel>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            if(string.IsNullOrEmpty(request.MSSV) || string.IsNullOrEmpty(request.password))
            {
                return Result.Failure<TokenModel>(new Error("","Dữ liệu đăng nhập không được phép để trống"));
            }

            var user = await _userRepository.FindByUserCode(request.MSSV);
            if(user == null)
            {
                return Result.Failure<TokenModel>(new Error("","Tài khoản không tồn tại"));
            }

            if (!user.IsActive)
            {
                return Result.Failure<TokenModel>(new Error("","Tài khoản đã bị khóa"));
            }

            var isValid = _passwordHasher.Verify(request.password, user.PasswordHash);
            if(!isValid)
            {
                return Result.Failure<TokenModel>(new Error("","Mật khẩu không chính xác"));
            }

            var token = await _tokenGenerator.CreateToken(user, populateExp: true);
            user.RefreshToken = token.RefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            _unitOfWork.Repository<UserApp>();
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return token;
            


        }
    }
}
