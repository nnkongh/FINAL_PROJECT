using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Comments.Delete
{
    public sealed record DeleteCommentCommand(int CommentId, int RequestedBy) : IRequest<Result>
    {
    }
}
