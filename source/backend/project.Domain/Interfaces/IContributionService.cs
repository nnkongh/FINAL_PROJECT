using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Domain.Interfaces
{
    public interface IContributionService
    {
        int CalculateContribution(int taskCompleted, int? totalCommit = null);
    }
}
