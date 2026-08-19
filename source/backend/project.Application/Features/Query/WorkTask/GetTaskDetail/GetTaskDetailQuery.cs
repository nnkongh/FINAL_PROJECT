using AutoMapper.Features;
using MediatR;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Domain.Helpers;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.WorkTask.GetTaskDetail
{
    public sealed record GetTaskDetailQuery(int TaskId, int RequestedBy) : IRequest<Result<TaskDetailModel>>
    {
    }

    public sealed record TaskDetailModel(int Id, string Title, TaskPriority TaskPriority, string? Description, TasksStatus TaskStatus, DateTime CreatedAt, DateTime? StartDate = null, DateTime? DueDate = null, DateTime? CompletedAt = null, TimeSpan? Duration = null, PullRequestModel? PR = null, string? Assignee = null, int CreatedBy = 0, string? CreatorName = null, int? AssignedTo = null);

    public sealed class GetTaskDetailHander : IRequestHandler<GetTaskDetailQuery, Result<TaskDetailModel>>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IGithubService _githubService;
        private readonly IGroupRepository _groupRepository;
        private readonly IClassroomRepository _classRoomRepository;
        public GetTaskDetailHander(IGroupRepository groupRepository, IGithubService githubService, IWorkTaskRepository taskRepository, IClassroomRepository classRoomRepository)
        {
            _groupRepository = groupRepository;
            _githubService = githubService;
            _taskRepository = taskRepository;
            _classRoomRepository = classRoomRepository;
        }

        public async Task<Result<TaskDetailModel>> Handle(GetTaskDetailQuery request, CancellationToken cancellationToken)
        {
            var task = await _taskRepository.GetWithCreatorAndAssigneeByIdAsync(request.TaskId);
            if (task == null) return Result.Failure<TaskDetailModel>(new Error("404", "Không tìm thấy task"));
            
            var group = await _groupRepository.GetByIdWithMemberAsync(task.GroupId);
            if (group == null) return Result.Failure<TaskDetailModel>(new Error("404", "Không tìm thấy nhóm"));
            if (!group.IsActive) return Result.Failure<TaskDetailModel>(new Error("403", "Nhóm đã bị vô hiệu hóa"));

            var classRoom = await _classRoomRepository.GetByIdAsync(group.ClassRoomId);
            if (classRoom == null) return Result.Failure<TaskDetailModel>(new Error("404", "Không tìm thấy lớp"));

            if (classRoom.TeacherId != request.RequestedBy)
            {
                var member = group.FindMember(request.RequestedBy);
                if (member == null) return Result.Failure<TaskDetailModel>(new Error("403", "Bạn không có quyền xem task này"));
            }

            if (group.GithubRepoUrl != null)
            {
                var (owner, repo) = GithubUrlParser.Parse(group.GithubRepoUrl!);
                PullRequestModel? pr = null;
                if (task.Status == TasksStatus.Test || task.Status == TasksStatus.Done)
                {
                    pr = await _githubService.GetPRByTaskIdAsync(owner, repo, task.Id);
                }
                return new TaskDetailModel(task.Id, task.Title, task.Priority, task.Description, task.Status, task.CreatedAt, task.StartDate, task.DueDate, task.CompletedAt, task.Duration, pr, task.Assignee?.UserName, task.CreatedBy, task.Creator?.UserName, task.AssignedTo);
            }
            else
            {
                return new TaskDetailModel(task.Id, task.Title, task.Priority, task.Description, task.Status, task.CreatedAt, task.StartDate, task.DueDate, task.CompletedAt, task.Duration, null, task.Assignee?.UserName, task.CreatedBy, task.Creator?.UserName, task.AssignedTo);
            }
        }
    };

}
