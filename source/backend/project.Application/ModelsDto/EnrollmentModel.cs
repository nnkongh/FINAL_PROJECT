using project.Application.ModelsDto.DomainModelsDto;

namespace project.Application.ModelsDto
{
    public class EnrollmentModel
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime JoinedAt { get; set; }
        public bool IsActive { get; set; }
        public string UserName { get; set; }
        public string UserRole { get; set; }
        public string UserCode { get; set; }
        public string Email { get; set; }
    }
}
