using MediatR;
using project.Application.ModelsDto;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Application.Features.Command.Classrooms.Create
{
    public sealed record CreateClassCommand(int RequestedBy, string ClassName, string SubjectName, string MajorType, int LimitedUser) : IRequest<Result<ClassRoomDetailModel>> { }
}
