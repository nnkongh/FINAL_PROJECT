using AutoMapper;
using MediatR;
using project.Application.ModelsDto.DomainModelsDto;
using project.Domain.Interfaces;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Features.Query.Users
{
    public sealed record SearchUserQuery(string Keyword) : IRequest<Result<IReadOnlyList<UserModel>>>
    {
    }
    public sealed class SearchUserHandler : IRequestHandler<SearchUserQuery, Result<IReadOnlyList<UserModel>>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        public SearchUserHandler(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<Result<IReadOnlyList<UserModel>>> Handle(SearchUserQuery request, CancellationToken cancellationToken)
        {
            if(string.IsNullOrEmpty(request.Keyword)) return Result.Failure<IReadOnlyList<UserModel>>(new Error("400", "Từ khóa tìm kiếm không được trống"));

            var users = await _userRepository.SearchAsync(request.Keyword);

            var dto = _mapper.Map<IReadOnlyList<UserModel>>(users);

            return Result.Success(dto);
        }
    }
}
