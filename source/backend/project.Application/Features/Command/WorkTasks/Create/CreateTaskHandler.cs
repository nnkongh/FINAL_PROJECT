using AutoMapper;
using MediatR;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Domain.Exceptions;
using project.Domain.Helpers;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.WorkTasks.Create
{
    public sealed class CreateTaskHandler : IRequestHandler<CreateTaskCommand, Result<TaskModel>>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITaskHistoryRepository _taskHistoryRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly INotificationService _notificationService;
        private readonly IGithubService _githubService;
        private readonly ITokenEncryptionService _tokenEncryption;
        private readonly IMapper _mapper;
        public CreateTaskHandler(IWorkTaskRepository taskRepository, IUnitOfWork unitOfWork, IMapper mapper, IGroupRepository groupRepository, INotificationService notificationService, IClassroomRepository classRoomRepository, ITaskHistoryRepository taskHistoryRepository, IGithubService githubService, ITokenEncryptionService tokenEncryption)
        {
            _taskRepository = taskRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _groupRepository = groupRepository;
            _notificationService = notificationService;
            _classRoomRepository = classRoomRepository;
            _taskHistoryRepository = taskHistoryRepository;
            _githubService = githubService;
            _tokenEncryption = tokenEncryption;
        }

        public async Task<Result<TaskModel>> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
        {
            try
            {
                if (request.DueDate.HasValue)
                {
                    if (request.DueDate.Value <  DateTime.UtcNow) return Result.Failure<TaskModel>(new Error("404", "Ngày đến hạn phải là ngày trong tương lai"));
                }
                var group = await _groupRepository.GetByIdWithMemberAsync(request.GroupId);
                if (group == null) return Result.Failure<TaskModel>(new Error("404", "Không tìm thấy nhóm"));
                if (!group.IsActive) return Result.Failure<TaskModel>(new Error("403", "Nhóm đã bị vô hiệu hóa"));
                if (group.GithubRepoUrl == null && group.MajorType == MajorType.IT) return Result.Failure<TaskModel>(new Error("400", "Nhóm chưa liên kết với Github Repo"));

                var classroom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
                if (classroom == null) return Result.Failure<TaskModel>(new Error("404", "Không tìm thấy lớp học"));
                if (!classroom.IsActive) return Result.Failure<TaskModel>(new Error("403", "Lớp học đã bị vô hiệu hóa"));

                var leader = group.FindMember(request.RequestedBy);
                if (leader == null) return Result.Failure<TaskModel>(new Error("403", "Bạn không phải là người trong nhóm"));

                var assigneeId = request.AssignedTo;
                if (assigneeId.HasValue)
                {
                    var member = group.FindMember(assigneeId.Value);
                    if (member == null || !member.IsActive) return Result.Failure<TaskModel>(new Error("404", "Người được giao không phải thành viên nhóm"));
                }


                await _unitOfWork.BeginTransactionAsync(cancellationToken);

                var task = WorkTask.Create(
                    request.GroupId, request.Title, request.RequestedBy,
                    request.TaskStatus, request.Priority, request.AssignedTo, request.DueDate, request.Description
                );

                await _taskRepository.AddAsync(task);
                await _unitOfWork.SaveChangesAsync(cancellationToken); // lấy task.Id

                // Tạo branch nếu là nhóm IT
                if (group.MajorType == MajorType.IT)
                {
                    var (owner, repo) = GithubUrlParser.Parse(group.GithubRepoUrl!);
                    var branchExists = await _githubService.IsBranchExistAsync(owner, repo, task.Id);
                    if (!branchExists)
                    {
                        if (assigneeId.HasValue)
                        {
                            var assignee = group.FindMember(assigneeId.Value);
                            if (assignee == null)
                                return Result.Failure<TaskModel>(new Error("400", "Người được giao không thuộc nhóm"));
                            if (!assignee.IsActive)
                                return Result.Failure<TaskModel>(new Error("403", "Người nhận task đã rời nhóm"));
                        }

                        var leaderUser = leader.User;
                        if (leaderUser?.GithubAccessToken == null)
                        {
                            await _unitOfWork.RollbackAsync(cancellationToken);
                            return Result.Failure<TaskModel>(new Error("400", "Leader chưa liên kết đến Github"));
                        }
                        var accessToken = _tokenEncryption.Decrypt(leaderUser.GithubAccessToken);
                        var branch = await _githubService.CreateBranchAsync(owner, repo, task.Id, accessToken);
                        if (branch == null)
                        {
                            await _unitOfWork.RollbackAsync(cancellationToken); // ← xóa task vừa tạo
                            return Result.Failure<TaskModel>(new Error("400", "Có lỗi khi tạo branch, vui lòng thử lại"));
                        }
                        task.ActivateBranch();
                    }
                }

                var history = TaskHistory.Create(task, request.RequestedBy, null, request.TaskStatus);
                await _taskHistoryRepository.AddAsync(history);

                await _taskRepository.Update(task);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _unitOfWork.CommitAsync(cancellationToken);

                if (assigneeId.HasValue && assigneeId.Value != request.RequestedBy)
                {
                    var notification = Notification.Create(assigneeId.Value, $"Bạn có task {task.Title} được giao trong nhóm {group.Name}", null, task.GroupId, "Task", task.Id);
                    await _notificationService.SendNotificationAsync(notification, cancellationToken);
                }

                var dto = _mapper.Map<TaskModel>(task);
               
                return Result.Success(dto);
            }
            catch (DomainException ex)
            {
                return Result.Failure<TaskModel>(new Error("400", $"{ex.Message}"));
            }
        }
    }
}
