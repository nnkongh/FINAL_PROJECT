using MediatR;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Classrooms.Delete
{
    public sealed record DeleteClassCommand(int ClassId, int RequestedBy) : IRequest<Result>
    {
    }
    public sealed class DeleteClassHandler : IRequestHandler<DeleteClassCommand, Result>
    {
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteClassHandler(IUnitOfWork unitOfWork, IClassroomRepository classRoomRepository)
        {
            _unitOfWork = unitOfWork;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result> Handle(DeleteClassCommand request, CancellationToken cancellationToken)
        {
            var classroom = await _classRoomRepository.GetClassroomWithEnrollmentsAsync(request.ClassId);
            if (classroom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp"));

            var teacher = classroom.FindEnrollment(request.RequestedBy);
            if (teacher == null || teacher.UserRole != Domain.Models.UserRole.Teacher)
                return Result.Failure(new Error("403", "Bạn không có quyền thực hiện chức năng này"));

            await _classRoomRepository.Delete(classroom);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
