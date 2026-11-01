using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Application.Features.Query.Comments
{
    public sealed class GetCommentsHandler : IRequestHandler<GetCommentsQuery, Result<IReadOnlyList<CommentModel>>>
    {
        private readonly ICommentRepository _commentRepository;
        public GetCommentsHandler(ICommentRepository commentRepository)
        {
            _commentRepository = commentRepository;
        }

        public async Task<Result<IReadOnlyList<CommentModel>>> Handle(GetCommentsQuery request, CancellationToken cancellationToken)
        {
            var comments = await _commentRepository.GetCommentsByTaskIdAsync(request.TaskId);
            if (comments == null) return Result.Success<IReadOnlyList<CommentModel>>(Array.Empty<CommentModel>());

            var dto = comments.Select(c => MapToModel(c)).ToList();
            return Result.Success<IReadOnlyList<CommentModel>>(dto);
        }
        private static CommentModel MapToModel(Comment c, int depth = 0) => new()
        {
            Id = c.Id,
            Content = c.Content,
            IsDeleted = c.IsDeleted,
            IsEdited = c.IsEdited,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            CreatedBy = c.UserId,
            IsTeacher = c.Task.Groups.Classroom.TeacherId == c.UserId,
            User = new CommentUserModel
            {
                Id = c.User.Id,
                Name = c.User.UserName,
                AvatarUrl = c.User.AvatarUrl
            },
            Replies = depth >= 1
            ? new List<CommentModel>()          // ← dừng ở tầng 2
        : c.Replies.Select(r => MapToModel(r, depth + 1)).ToList()
        };
    }
}
