using AutoMapper;
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

namespace project.Application.Features.Command.User.Import
{
    public sealed class ImportUserHandler : IRequestHandler<ImportUserCommand, ImportResultDto>
    {
        private readonly IExcelImportService _excelService;
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IUnitOfWork _unitOfWork;
        public ImportUserHandler(IExcelImportService excelService, IUserRepository userRepository, IPasswordHasher passwordHasher, IUnitOfWork unitOfWork)
        {
            _excelService = excelService;
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _unitOfWork = unitOfWork;
        }

        public async Task<ImportResultDto> Handle(ImportUserCommand request, CancellationToken cancellationToken)
        {
            var rows = _excelService.ParseUser(request.fileBytes);

            int success = 0, failed = 0;
            var errors = new List<string>();

            foreach(var row in rows)
            {
                try
                {
                    if (await _userRepository.IsEmailExistsAsync(row.Email))
                    {
                        errors.Add($"Email {row.Email} đã tồn tại");
                        failed++;
                        continue;
                    }
                    ;
                    var role = row.Role.ToLower() == "teacher" ? UserRole.Teacher : UserRole.Student;

                    var passwordHash = _passwordHasher.Hash(row.UserCode);

                    var user = UserApp.Create(row.UserName, row.Email, passwordHash, row.UserCode, role);
                    await _userRepository.AddAsync(user);
                    success++;
                }
                catch (Exception ex)
                {
                    errors.Add($"Dòng {row.UserCode}: {ex.Message}");
                    failed++;
                }
            }
            _unitOfWork.Repository<UserApp>();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return new ImportResultDto { Success = success, Failed = failed, Errors = errors};
        }
    }
}
