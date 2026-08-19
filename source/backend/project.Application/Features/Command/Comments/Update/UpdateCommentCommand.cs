using MediatR;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.Comments.Update
{
    public sealed record UpdateCommentCommand(int CommentId, string Content, int RequestedBy) : IRequest<Result>
    {
    }
}
