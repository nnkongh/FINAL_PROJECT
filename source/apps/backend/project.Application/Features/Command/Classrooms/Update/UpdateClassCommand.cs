using MediatR;
using project.Application.ModelsDto;
using project.Domain.Shared;

namespace project.Application.Features.Command.Classrooms.Update
{
    public sealed record UpdateClassCommand(int RequestedBy, int ClassroomId, string SubjectName, string ClassName) : IRequest<Result<ClassroomUpdateModel>> { }
}
