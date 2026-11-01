using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Classrooms.JoinClass
{
    public sealed class JoinClassHandler : IRequestHandler<JoinClassCommand, Result>
    {
        private readonly IUserRepository _userRepository;
        private readonly IClassroomRepository _classroomRepository;
        private readonly IUnitOfWork _unitOfWork;
        public JoinClassHandler(IClassroomRepository classroomRepository, IUserRepository userRepository, IUnitOfWork unitOfWork)
        {
            _classroomRepository = classroomRepository;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<Result> Handle(JoinClassCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var student = await _userRepository.GetByIdAsync(request.RequestedBy);
                if (student == null) return Result.Failure(new Error("404", "Không tìm thấy người dùng"));

                var classRoom = await _classroomRepository.GetByClassCodeWithEnrollmentsAsync(request.ClassCode);
                if (classRoom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp"));

                var enrollStudent = classRoom.EnrollStudent(student,request.ClassCode);

                await _classroomRepository.Update(classRoom);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return Result.Success();

            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error("400", ex.Message));
            }
        }
    }
}
