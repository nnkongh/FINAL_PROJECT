using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.ModelsDto
{
    public class Message
    {
        public List<string> To { get; set; } = new List<string>();
        public string Subject { get; set; } 
        public string Body { get; set; } 

        public Message(IEnumerable<string> to, string? subject, string? body)
        {
            To = new List<string>();
            To.AddRange(to.Select(x => x.ToString()));
            Subject = subject;
            Body = body;
        }
        public Message(string to, string? subject, string? body)
        {
            To = new List<string> { to };
            Subject = subject;
            Body = body;
        }
    }
}
