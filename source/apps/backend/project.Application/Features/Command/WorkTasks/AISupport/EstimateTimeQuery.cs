using MediatR;
using project.Application.Interfaces;
using project.Domain.Exceptions;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.WorkTasks.AISupport
{
    public sealed record AISuportCommand(string ActionType, string TaskTitle, string? TaskDescription) : IRequest<Result<string?>>
    {
    }
    public class AISupportQueryHandler : IRequestHandler<AISuportCommand, Result<string?>>
    {
        private readonly IGeminiService _geminiService;

        public AISupportQueryHandler(IGeminiService geminiService)
        {
            _geminiService = geminiService;
        }

        public async Task<Result<string?>> Handle(AISuportCommand request, CancellationToken cancellationToken)
        {
            var result = request.ActionType switch
            {
                "description" => await _geminiService.GenerateTaskDescriptionAsync(request.TaskTitle),
                "subtasks" => await _geminiService.SuggestSubTasksAsync(request.TaskTitle),
                "estimate" => await _geminiService.EstimateTimeAsync(request.TaskTitle),
                "priority" => await _geminiService.SuggestPriorityAsync(request.TaskTitle, request.TaskDescription ?? ""),
                _ => null
            };
            if (result is null)
                return Result.Failure<string?>(new Error("AI.InvalidAction", "ActionType không hợp lệ"));

            return Result.Success<string?>(result);
        }
    }
}