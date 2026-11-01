using project.Application.ModelsDto;
using project.Application.ModelsDto.DomainModelsDto;
using project.Domain.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Interfaces
{
    public interface IAuthService
    {
        Task<Result> ForgotPassword(string emai, string clientUri);
    }
}
