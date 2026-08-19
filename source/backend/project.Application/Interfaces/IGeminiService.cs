using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.Interfaces
{
    public interface IGeminiService
    {
        public Task<string?> GenerateTaskDescriptionAsync(string taskTitle);

        public Task<string?> SuggestSubTasksAsync(string taskTitle);

        public Task<string?> EstimateTimeAsync(string taskTitle);

        public Task<string?> SuggestPriorityAsync(string taskTitle, string taskDescription);


    }
}
