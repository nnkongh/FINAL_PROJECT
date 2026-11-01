using project.Application.ModelsDto.DomainModelsDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application.ModelsDto
{
    public class CommentModel
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
        public bool IsEdited { get; set; }
        public bool IsTeacher { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
        public int CreatedBy { get; set; }
        public CommentUserModel User { get; set; }
        public List<CommentModel> Replies { get; set; } = new ();
    }
    public class CommentUserModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
