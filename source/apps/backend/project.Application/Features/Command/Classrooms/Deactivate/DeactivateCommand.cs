using MediatR;
using project.Domain.Shared;

namespace project.Application.Features.Command.Classrooms.Deactivate
{
    public sealed record DeactivateCommand(int RequestedBy, int ClassId) : IRequest<Result>
    {
    }
}
