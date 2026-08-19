using AutoMapper;
using project.Application.ModelsDto;
using project.Application.ModelsDto.DomainModelsDto;
using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Application
{
    public class ObjectMapper : Profile
    {
        public ObjectMapper()
        {
            CreateMap<UserApp,UserModel>().ReverseMap();

            CreateMap<WorkTask, TaskModel>()
                .ForMember(d => d.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(d => d.Priority, opt => opt.MapFrom(src => src.Priority.ToString()))
                .ForMember(d => d.IsAssigned, opt => opt.MapFrom(src => src.IsAssigned()))
                .ForMember(d => d.IsOverdue, opt => opt.MapFrom(src => src.IsOverdue()))
                .ForMember(d => d.Duration, opt => opt.MapFrom(src => src.Duration));


            CreateMap<Groups, GroupDetailModel>()
                .ForMember(d => d.ActiveMemberCount, opt => opt.MapFrom(src => src.ActiveMemberCount()))
                .ForMember(d => d.TotalTaskCount, opt => opt.MapFrom(src => src.TotalTaskCount()))
                .ForMember(d => d.OverdueTasks, opt => opt.MapFrom(src => src.OverdueTasksCount()))
                .ForMember(d => d.TestTasks, opt => opt.MapFrom(src => src.TestTasksCount()))
                .ForMember(d => d.DoneTasks, opt => opt.MapFrom(src => src.DoneTasksCount()))
                .ForMember(d => d.InProgressTasks, opt => opt.MapFrom(src => src.InProgressTasksCount()))
                .ForMember(d => d.TodoTasks, opt => opt.MapFrom(src => src.TodoTasksCount()));

            CreateMap<GroupMem, GroupMemModel>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.User.AvatarUrl))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()))
                .ForMember(dest => dest.UserCode, opt => opt.MapFrom(src => src.User.UserCode))
                .ForMember(dest => dest.GithubUserName, opt => opt.MapFrom(src => src.User.GithubUserName))
                .ForMember(dest => dest.LinkedGithubAccount, opt => opt.MapFrom(src => src.User.LinkedGithubAccount));

            CreateMap<Groups, GroupModel>()
                .ForMember(d => d.TotalMemberCount, opt => opt.MapFrom(src => src.Members.Count))
                .ForMember(d => d.ClassName, opt => opt.MapFrom(src => src.Classroom.ClassName))
                .ForMember(d => d.ClassRoomId, opt => opt.MapFrom(src => src.ClassRoomId))
                .ForMember(d => d.TotalTasks, opt => opt.MapFrom(src => src.Tasks.Count))
                .ForMember(d => d.TotalTasksDone, opt => opt.MapFrom(src => src.DoneTasksCount()))
                .ForMember(d => d.GithubRepoUrl, opt => opt.MapFrom(src => src.GithubRepoUrl));


            CreateMap<Comment, CommentModel>()
                .ForMember(d => d.CreatedBy, opt => opt.MapFrom(src => src.UserId))
                .ForMember(d => d.User, opt => opt.MapFrom(src => src.User));

            CreateMap<UserApp, CommentUserModel>()
                .ForMember(d => d.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(d => d.Name, opt => opt.MapFrom(src => src.UserName))
                .ForMember(d => d.AvatarUrl, opt => opt.MapFrom(src => src.AvatarUrl));

            CreateMap<Notification, NotificationModel>();

            CreateMap<Classroom, ClassRoomSumaryModel>()
                .ForMember(dest => dest.TotalGroups, opt => opt.MapFrom(src => src.Groups.Count))
                .ForMember(dest => dest.TotalEnrollments, opt => opt.MapFrom(src => src.CountClassEnrollments()));

            CreateMap<Classroom, ClassRoomDetailModel>()
                .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => src.Teacher.UserName))
                .ForMember(dest => dest.MaxMembersPerGroup, opt => opt.MapFrom(src => src.MaxMembersPerGroup))
                .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.SubjectName))
                .ForMember(dest => dest.MajorType, opt => opt.MapFrom(src => src.MajorType.ToString()))
                .ForMember(dest => dest.GroupCreated, opt => opt.MapFrom(src => src.CountGroups()))
                .ForMember(dest => dest.MembersWithoutGroup, opt => opt.MapFrom(src => src.CountStudentsWithoutGroup()))
                .ForMember(dest => dest.ClassName, opt => opt.MapFrom(src => src.ClassName))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.NumberEnrollments, opt => opt.MapFrom(src => src.CountClassEnrollments()));

            CreateMap<ClassEnrollment, EnrollmentModel>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.UserRole, opt => opt.MapFrom(src => src.User.UserRole))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.UserCode, opt => opt.MapFrom(src => src.User.UserCode));
                

            CreateMap<Classroom, ClassroomEnrollmentModel>()
                .ForMember(dest => dest.Teacher, opt => opt.MapFrom(src => src.Teacher.UserName))
                .ForMember(dest => dest.Enrollments, opt => opt.MapFrom(src => src.Enrollments.Where(x => x.UserRole == UserRole.Student)));

            CreateMap<Classroom, ClassroomGroupsModel>();
            CreateMap<Classroom, ClassroomUpdateModel>();

            CreateMap<TaskHistory, TaskHistoryModel>()
                .ForMember(dest => dest.TaskId, opt => opt.MapFrom(src => src.TaskId))
                .ForMember(dest => dest.ChangedBy, opt => opt.MapFrom(src => src.ChangedBy))
                .ForMember(dest => dest.OldStatus, opt => opt.MapFrom(src => src.OldStatus.ToString()))
                .ForMember(dest => dest.NewStatus, opt => opt.MapFrom(src => src.NewStatus.ToString()))
                .ForMember(dest => dest.ChangedAt, opt => opt.MapFrom(src => src.ChangedAt));

            CreateMap<WorkTask, TaskOverDueModel>()
                .ForMember(dest => dest.DueDate, opt => opt.MapFrom(src => src.DueDate))
                .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.AssignedTo, opt => opt.MapFrom(src => src.AssignedTo));
        }
    }
}
