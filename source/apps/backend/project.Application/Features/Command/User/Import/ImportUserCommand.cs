using MediatR;
using project.Application.ModelsDto;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.User.Import
{
    public sealed record ImportUserCommand(byte[] fileBytes) : IRequest<ImportResultDto>
    {
    }

    public class ImportResultDto
    {
        public int Success { get; set; }
        public int Failed { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}
