using MediatR;
using project.Domain.Shared;

namespace project.Application.Features.Command.Classrooms.JoinClass
{
    public sealed record JoinClassCommand(int RequestedBy, string ClassCode) : IRequest<Result> { }
}
