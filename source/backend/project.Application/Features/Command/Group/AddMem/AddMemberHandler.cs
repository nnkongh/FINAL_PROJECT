using MediatR;
using project.Application.Interfaces;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Group.AddMem
{
    public sealed class AddMemberHandler : IRequestHandler<AddMemberCommand, Result>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;
        public AddMemberHandler(IGroupRepository groupRepository, IUnitOfWork unitOfWork, INotificationService notificationService, IClassroomRepository classRoomRepository)
        {
            _groupRepository = groupRepository;
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result> Handle(AddMemberCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
                if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm"));

                var classroom = await _classRoomRepository.GetClassroomWithEnrollmentsAsync(group.ClassRoomId);
                if (classroom == null) return Result.Failure(new Error("404", "Không tìm thấy lớp học"));

                var member = GroupMem.Create(group,request.UserId);
                group.AddMember(member, classroom, request.RequestedBy);

                await _unitOfWork.Repository<Groups>().Update(group);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var notification = Notification.Create(request.UserId, $"Bạn được thêm vào nhóm {group.Name}", null, request.GroupId, "Group", request.GroupId);
                await _notificationService.SendNotificationAsync(notification,cancellationToken);

                return Result.Success();
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error("401", $"{ex.Message}"));
            }
        }
    }
}
