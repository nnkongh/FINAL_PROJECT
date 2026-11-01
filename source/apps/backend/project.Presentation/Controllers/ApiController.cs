using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace project.Presentation.Controllers
{
    [ApiController]
    public class ApiController : Controller
    {
        protected readonly ISender _sender;

        public ApiController(ISender sender)
        {
            _sender = sender;
        }
    }
}
