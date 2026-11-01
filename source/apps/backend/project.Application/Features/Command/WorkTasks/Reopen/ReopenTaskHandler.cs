using MediatR;
using project.Application.Interfaces.CachedModel;
using project.Domain.Exceptions;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Command.WorkTasks.Reopen
{
    public sealed class ReopenTaskHandler : IRequestHandler<ReopenTaskCommand, Result>
    {
        private readonly IWorkTaskRepository _taskRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheInvalidator _cacheInvalidator;

        public ReopenTaskHandler(IUnitOfWork unitOfWork, IWorkTaskRepository taskRepository, ICacheInvalidator cacheInvalidator)
        {
            _unitOfWork = unitOfWork;
            _taskRepository = taskRepository;
            _cacheInvalidator = cacheInvalidator;
        }

        public async Task<Result> Handle(ReopenTaskCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var task = await _taskRepository.GetByIdAsync(request.TaskId);
                if (task == null) return Result.Failure(new Error("404", "Không tìm thấy task"));

                task.Reopen();
                _unitOfWork.Repository<WorkTask>();
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _cacheInvalidator.InvalidateTaskAsync(task.Id, cancellationToken);
                await _cacheInvalidator.InvalidateGroupAsync(task.GroupId, cancellationToken);

                return Result.Success();

            }
            catch (DomainException ex)
            {
                return Result.Failure(new Error("401", $"{ex.Message}"));
            }
        }
    }
}
