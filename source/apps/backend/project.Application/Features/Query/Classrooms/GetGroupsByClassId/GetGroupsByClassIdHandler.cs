using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Application.Features.Query.Classrooms.GetGroupsByClassId
{
    public sealed class GetGroupsByClassIdHandler : IRequestHandler<GetGroupsByClassIdQuery, Result<IReadOnlyList<GroupSummaryModel>>>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUserRepository _userRepository;

        public GetGroupsByClassIdHandler( IClassroomRepository classroomRepository, IGroupRepository groupRepository, IUserRepository userRepository)
        {
            _classRoomRepository = classroomRepository;
            _groupRepository = groupRepository;
            _userRepository = userRepository;
        }

        public async Task<Result<IReadOnlyList<GroupSummaryModel>>> Handle(GetGroupsByClassIdQuery request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.RequestedBy);
            if (user == null) return Result.Failure<IReadOnlyList<GroupSummaryModel>>(new Error("404", "Không tìm thấy người dùng"));

            var classRooms = await _classRoomRepository.GetByIdAsync(request.ClassId);
            if (classRooms == null) return Result.Failure<IReadOnlyList<GroupSummaryModel>>(new Error("404", "Không tìm thấy lớp"));

            var groups = await _groupRepository.GetGroupsWithTasksByIdClassIdAsync(request.ClassId);

            int? myGroupId = null;
            if (user.UserRole == UserRole.Student)
            {
                var myGroup = groups.FirstOrDefault(g => g.Members.Any(m => m.UserId == request.RequestedBy && m.IsActive));
                myGroupId = myGroup?.Id;
            }

            var result = groups.Select(g =>
            {
                var isTeacher = user.UserRole == UserRole.Teacher;
                var isMyGroup = g.Id == myGroupId;

                var progress = (isTeacher || isMyGroup)
            ? new GroupProgressModel
            {
                TotalTasks = g.TotalTaskCount(),
                DoneTasks = g.Tasks.Count(t => t.Status == TasksStatus.Done),
                InProgressTasks = g.Tasks.Count(t => t.Status == TasksStatus.InProgress),
                TodoTasks = g.Tasks.Count(t => t.Status == TasksStatus.ToDo),
                TestTasks = g.Tasks.Count(t => t.Status == TasksStatus.Test)
            }
            : null;
                return new GroupSummaryModel
                {
                    Id = g.Id,
                    Name = g.Name,
                    SubjectName = g.SubjectOrProjectName,
                    MemberCount = g.ActiveMemberCount(),
                    LimitedUser = g.LimitedUser,
                    IsMyGroup = isMyGroup,
                    Progress = progress
                };
            }).ToList();

            return Result.Success<IReadOnlyList<GroupSummaryModel>>(result);
        }
    }
}
