using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;

namespace project.Application.Features.Query.Notifications
{
    public sealed class GetNotificationHandler : IRequestHandler<GetNotificationQuery, Result<IReadOnlyList<NotificationModel>>>
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IMapper _mapper;
        public GetNotificationHandler(INotificationRepository notificationRepository, IMapper mapper)
        {
            _notificationRepository = notificationRepository;
            _mapper = mapper;
        }

        public async Task<Result<IReadOnlyList<NotificationModel>>> Handle(GetNotificationQuery request, CancellationToken cancellationToken)
        {
            var noti = await _notificationRepository.GetNotificationByUserId(request.RequestedBy);
            if (noti == null) return Result.Failure<IReadOnlyList<NotificationModel>>(new Error("404", "Không tìm thấy thông báo"));

            var dto = _mapper.Map<IReadOnlyList<NotificationModel>>(noti);
            return Result.Success(dto);
            
        }
    }
}
