using AutoMapper;
using MediatR;
using project.Application.Interfaces;
using project.Application.ModelsDto;
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

namespace project.Application.Features.Command.Comments.Create
{
    public sealed class CreateCommentHandler : IRequestHandler<CreateCommentCommand, Result<CommentModel>>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IClassroomRepository _classRoomRepository;
        private readonly IUserRepository _userRepository;
        public CreateCommentHandler(IWorkTaskRepository taskRepository, IUnitOfWork unitOfWork, IGroupRepository groupRepository, INotificationService notificationService, IClassroomRepository classRoomRepository, IUserRepository userRepository)
        {
            _taskRepository = taskRepository;
            _unitOfWork = unitOfWork;
            _groupRepository = groupRepository;
            _notificationService = notificationService;
            _classRoomRepository = classRoomRepository;
            _userRepository = userRepository;
        }

        public async Task<Result<CommentModel>> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var task = await _taskRepository.GetByIdAsync(request.TaskId);
                if (task == null) return Result.Failure<CommentModel>(new Error("404", "Không tìm thấy task"));

                var group = await _groupRepository.GetByIdWithMemberAsync(task.GroupId);
                if (group == null) return Result.Failure<CommentModel>(new Error("404", "Không tìm thấy nhóm"));
                if (!group.IsActive) return Result.Failure<CommentModel>(new Error("403", "Không thể thêm bình luận vào nhóm bị vô hiệu hóa"));

                var classRoom = await _classRoomRepository.GetClassroomWithEnrollmentsAsync(group.ClassRoomId);
                if (classRoom == null) return Result.Failure<CommentModel>(new Error("404", "Không tìm thấy lớp học"));
                if (!classRoom.IsActive) return Result.Failure<CommentModel>(new Error("403", "Không thể thêm bình luận vào lớp học bị vô hiệu hóa"));

                if (classRoom.TeacherId != request.UserId) {
                    var member = group.FindMember(request.UserId);
                    if (member == null) return Result.Failure<CommentModel>(new Error("403", "Bạn không phải là thành viên trong nhóm"));
                }
                var actualParentId = request.ParentCommentId;

                if (request.ParentCommentId.HasValue)
                {
                    var parentComment = await _unitOfWork.Repository<Comment>().GetByIdAsync(request.ParentCommentId.Value);
                    if (parentComment == null) return Result.Failure<CommentModel>(new Error("404", "Không tìm thấy comment cha"));

                    actualParentId = parentComment.ParentCommentId.HasValue
                        ? parentComment.ParentCommentId.Value  // cha của nó là root
                        : parentComment.Id;                    // chính nó là root
                }

                var user = await _userRepository.GetByIdAsync(request.UserId);

                var comment = Comment.Create(request.TaskId, request.UserId, request.Content, actualParentId);

                await _unitOfWork.Repository<Comment>().AddAsync(comment);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                if(task.AssignedTo != request.UserId) // chỉ thông báo nếu người comment task này không phải là người nhận task này
                {
                    var member = group.FindMember(request.UserId);
                    var notification = Notification.Create(task.AssignedTo!.Value, $"{user!.UserName} vừa bình luận vào task {task.Title} trong nhóm {group.Name}", null, group.Id, "Comment", comment.Id);
                    await _notificationService.SendNotificationAsync(notification,cancellationToken);
                }
                var dto = new CommentModel
                {
                    Id = comment.Id,
                    Content = comment.Content,
                    IsDeleted = comment.IsDeleted,
                    IsEdited = comment.IsEdited,
                    CreatedAt = comment.CreatedAt,
                    UpdatedAt = comment.UpdatedAt,
                    CreatedBy = comment.UserId,
                    IsTeacher = classRoom.TeacherId == comment.UserId, 
                    User = new CommentUserModel
                    {
                        Id = user!.Id,
                        Name = user.UserName,
                        AvatarUrl = user.AvatarUrl
                    },
                    Replies = new List<CommentModel>() 
                };
                return Result.Success(dto);

            }
            catch (DomainException ex)
            {
                return Result.Failure<CommentModel>(new Error("400", $"{ex.Message}"));
            }
         
        }
    }
}
