using MediatR;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Application.Features.Command.Notifcations.ReadNotiById
{
    public sealed class ReadNotificationHandler : IRequestHandler<ReadNotificationCommand,Result>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationRepository _notificationRepository;

        public ReadNotificationHandler(INotificationRepository notificationRepository, IUnitOfWork unitOfWork)
        {
            _notificationRepository = notificationRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(ReadNotificationCommand request, CancellationToken cancellationToken)
        {
            var noti = await _notificationRepository.GetByIdAsync(request.Id);
            if (noti == null) return Result.Failure(new Error("404", "Không tìm thấy thông báo"));

            if (noti.UserId != request.RequestedBy) return Result.Failure(new Error("403", "Bạn không có quyền đọc thông báo này"));

            noti.MarkAsRead();
            _unitOfWork.Repository<Notification>();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return Result.Success();
        }
    }
}
