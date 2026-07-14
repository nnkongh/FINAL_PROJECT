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
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.WorkTasks.Delete
{
    public sealed class DeleteTaskHandler : IRequestHandler<DeleteTaskCommand, Result>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITaskHistoryRepository _taskHistory;
        private readonly IGroupRepository _groupRepository;
        private readonly IGithubService _githubService;
        private readonly ITokenEncryptionService _tokenEncryption;
        private readonly IClassroomRepository _classRoomRepository;
        public DeleteTaskHandler(IWorkTaskRepository taskRepository, IUnitOfWork unitOfWork, IGroupRepository groupRepository, IClassroomRepository classRoomRepository, IGithubService githubService, ITokenEncryptionService tokenEncryption, ITaskHistoryRepository taskHistory)
        {
            _taskRepository = taskRepository;
            _unitOfWork = unitOfWork;
            _groupRepository = groupRepository;
            _classRoomRepository = classRoomRepository;
            _githubService = githubService;
            _tokenEncryption = tokenEncryption;
            _taskHistory = taskHistory;
        }
        public async Task<Result> Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var task = await _taskRepository.GetWithCreatorAndAssigneeByIdAsync(request.TaskId);
                if (task == null) return Result.Failure(new Error("404", "Không tìm thấy task cần xóa"));

                var group = await _groupRepository.GetByIdWithMemberAsync(task.GroupId);
                if (group == null) return Result.Failure(new Error("404", "Không tìm thấy nhóm của task"));
                if (!group.IsActive) return Result.Failure(new Error("403", "Nhóm đã bị khóa"));

                var classroom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
                if (classroom == null) return Result.Failure<TaskModel>(new Error("404", "Không tìm thấy lớp học"));
                if (!classroom.IsActive) return Result.Failure<TaskModel>(new Error("403", "Lớp học đã bị vô hiệu hóa"));

                var leader = group.FindMember(request.RequestedBy);
                if (leader == null || !leader.IsLeader()) return Result.Failure<TaskModel>(new Error("403", "Chỉ có leader được xóa task"));

                await _unitOfWork.BeginTransactionAsync(cancellationToken);

                if (group.MajorType == MajorType.IT && task.HasBranch == true && group.GithubRepoUrl != null)
                {
                    var leaderUser = leader.User;
                    if (leaderUser?.GithubAccessToken == null)
                    {
                        await _unitOfWork.RollbackAsync(cancellationToken);
                        return Result.Failure(new Error("400", "Leader chưa liên kết đến repo"));
                    }

                    var (owner, repo) = GithubUrlParser.Parse(group.GithubRepoUrl);
                    var accessToken = _tokenEncryption.Decrypt(leaderUser.GithubAccessToken);
                    var delete = await _githubService.DeleteBranchAsync(owner, repo, task.Id, accessToken);
                    if (!delete) return Result.Failure(new Error("400", "Không thể xóa branch"));
                    await _unitOfWork.RollbackAsync(cancellationToken);
                }
                var taskHistory = TaskHistory.Create(task, request.RequestedBy);
                await _taskRepository.Delete(task);
                await _taskHistory.AddAsync(taskHistory);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _unitOfWork.CommitAsync(cancellationToken);

                return Result.Success();
            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error("401", $"{ex.Message}"));
            }
        }
    }
}
