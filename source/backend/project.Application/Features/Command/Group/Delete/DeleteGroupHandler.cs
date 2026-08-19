using MediatR;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Group.Delete
{
    public sealed class DeleteGroupHandler : IRequestHandler<DeleteGroupCommand, Result>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUnitOfWork _unitOfWork;
        public DeleteGroupHandler(IGroupRepository groupRepository, IUnitOfWork unitOfWork, IClassroomRepository classRoomRepository)
        {
            _groupRepository = groupRepository;
            _unitOfWork = unitOfWork;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result> Handle(DeleteGroupCommand request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
            if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));

           
            var classroom = await _classRoomRepository.GetClassroomWithEnrollmentsAsync(group.ClassRoomId);
            if (classroom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp học"));
            if (!classroom.IsActive) return Result.Failure(new Error("403", "Không thể thao tác trên lớp học bị vô hiệu hóa"));

            if (classroom.TeacherId != request.RequetedBy)
            {
                var member = group.FindMember(request.RequetedBy);
                if (member == null) return Result.Failure(new Error("403", "Bạn không phải là thành viên của nhóm này"));
                if (!member.IsLeader()) return Result.Failure(new Error("403", "Bạn không phải là trưởng nhóm"));
            }

            var enrollment = classroom.FindEnrollment(request.RequetedBy);
            if (enrollment == null || !enrollment.IsActive) return Result.Failure(new Error("403", "Bạn không phải là thành viên trong lớp"));
            enrollment.UnsetGroup();

            await _unitOfWork.Repository<Classroom>().Update(classroom);
            _unitOfWork.Repository<Groups>().Delete(group);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
