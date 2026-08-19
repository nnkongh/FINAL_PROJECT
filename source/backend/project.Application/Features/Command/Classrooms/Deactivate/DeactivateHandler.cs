using MediatR;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Classrooms.Deactivate
{
    public sealed class DeactivateHandler : IRequestHandler<DeactivateCommand, Result>
    {
        private readonly IClassroomRepository _classroomRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeactivateHandler(IUnitOfWork unitOfWork, IClassroomRepository classroomRepository)
        {
            _unitOfWork = unitOfWork;
            _classroomRepository = classroomRepository;
        }

        public async Task<Result> Handle(DeactivateCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var classRoom = await _classroomRepository.GetByIdAsync(request.ClassId);
                if (classRoom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp"));

                classRoom.Deactivate(request.RequestedBy);
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
