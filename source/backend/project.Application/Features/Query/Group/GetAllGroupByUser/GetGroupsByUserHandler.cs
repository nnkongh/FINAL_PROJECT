using AutoMapper;
using MediatR;
using project.Application.ModelsDto;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Group.GetAllGroupByUser
{
    public sealed class GetGroupsByUserHandler : IRequestHandler<GetGroupsByUserQuery, Result<IReadOnlyList<GroupModel>>>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IMapper _mapper;

        public GetGroupsByUserHandler(IGroupRepository groupRepository, IMapper mapper)
        {
            _groupRepository = groupRepository;
            _mapper = mapper;
        }

        public async Task<Result<IReadOnlyList<GroupModel>>> Handle(GetGroupsByUserQuery request, CancellationToken cancellationToken)
        {
            var groups = await _groupRepository.GetAllGroupsByUserIdAsync(request.UserId);
            if (groups == null) return Result.Failure<IReadOnlyList<GroupModel>>(new Error("404", "Bạn chưa có nhóm nào"));

            var dto = _mapper.Map<IReadOnlyList<GroupModel>>(groups);

            return Result.Success(dto);
        }
    }
}
