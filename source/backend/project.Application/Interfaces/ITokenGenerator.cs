using project.Application.ModelsDto;
using project.Application.ModelsDto.DomainModelsDto;
using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Interfaces
{
    public interface ITokenGenerator
    {
        Task<TokenModel> CreateToken(UserApp user, bool populateExp);
        string GenerateResetPasswordToken();
        int? GetUserIdFromExpiredToken(string token);
    }
}
