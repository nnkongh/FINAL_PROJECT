using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Interfaces.CachedModel
{
    public interface ICacheInvalidator
    {
        Task InvalidateUserAsync(int userId, CancellationToken ct = default);
        Task InvalidateGroupAsync(int groupId, CancellationToken ct = default);
        Task InvalidateTaskAsync(int taskId, CancellationToken ct = default);
    }
}
