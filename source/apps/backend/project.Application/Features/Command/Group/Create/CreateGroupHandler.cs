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
using System.Transactions;

namespace project.Application.Features.Command.Group.Create
{
    public sealed class CreateGroupHandler : IRequestHandler<CreateGroupCommand, Result<GroupModel>>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public CreateGroupHandler(IGroupRepository groupRepository, IUnitOfWork unitOfWork, IMapper mapper, IClassroomRepository classRoomRepository)
        {
            _groupRepository = groupRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result<GroupModel>> Handle(CreateGroupCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var classRoom = await _classRoomRepository.GetClassroomWithEnrollmentsAsync(request.ClassRoomId);
                if (classRoom == null) return Result.Failure<GroupModel>(new Error("404", "Không tìm thấy lớp học"));
                if (!classRoom.IsActive) return Result.Failure<GroupModel>(new Error("400", "Lớp học đã bị khóa"));
                if (classRoom.MaxMembersPerGroup < request.LimitedUser) return Result.Failure<GroupModel>(new Error("400", "Số lượng thành viên nhóm vượt quá số lượng sinh viên trong lớp"));

                var enrollment = classRoom.FindEnrollment(request.CreateBy);
                if (enrollment == null) return Result.Failure<GroupModel>(new Error("403", "Bạn không phải thành viên của lớp"));
                if (enrollment.GroupId != null) return Result.Failure<GroupModel>(new Error("400", "Sinh viên chỉ được tạo một nhóm"));
                
                await _unitOfWork.BeginTransactionAsync(cancellationToken);

                var group = Groups.Create(request.NameGroup, request.SubjectName, request.CreateBy, request.LimitedUser, classRoom.MajorType,classRoom.Id,enrollment.Id);
                await _groupRepository.AddAsync(group);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                var leader = GroupMem.Create(group,request.CreateBy, GroupMemberRole.Leader);
                group.InitLeader(leader, classRoom);
                enrollment.SetGroup(group.Id);

                await _classRoomRepository.Update(classRoom);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                await _unitOfWork.CommitAsync(cancellationToken);

                var dto = _mapper.Map<GroupModel>(group);

                return Result.Success(dto);
            }
            catch(DomainException ex)
            {
                await _unitOfWork.RollbackAsync(cancellationToken);
                return Result.Failure<GroupModel>(new Error("401", $"{ex.Message}"));
            }
        }
    }
}
