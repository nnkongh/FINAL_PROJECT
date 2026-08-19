using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using project.Application.Interfaces;
using project.Domain.Interfaces;
using project.Domain.Models;
using project.Infrastructure.Database;
using project.Infrastructure.Interfaces;
using project.Infrastructure.Caching;
using project.Infrastructure.Repositories;
using project.Infrastructure.Security;
using project.Infrastructure.Services.Email;
using project.Infrastructure.Services.ExcelImport;
using project.Infrastructure.Services.FileStorage;
using project.Infrastructure.Services.Gemini;
using project.Infrastructure.Services.GithubService;
using project.Infrastructure.Services.Photo;
using project.Infrastructure.Services.ReportPdf;
using project.Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using static Org.BouncyCastle.Math.EC.ECCurve;
using Microsoft.Extensions.Caching.Distributed;

namespace project.Infrastructure.Depedencies
{
    public static class PersistenceInject
    {

        public static IServiceCollection AddConnectionDatabase(this IServiceCollection services, IConfiguration config)
        {
            var connectionString = config.GetConnectionString("DefaultConnection");
            services.AddDbContextPool<ApplicationDbContext>(opt =>
            {
                opt.UseSqlServer(connectionString);
            }, poolSize: 128);

            return services;
        }
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<WorkTaskRepository>();
            services.AddScoped<IWorkTaskRepository>(sp =>
                new CachedTaskRepository(
                    sp.GetRequiredService<WorkTaskRepository>(),
                    sp.GetRequiredService<Microsoft.Extensions.Caching.Distributed.IDistributedCache>()));
            services.AddScoped<ICommentRepository, CommentRepository>();

            services.AddScoped<GroupRepository>();
            services.AddScoped<IGroupRepository>(sp =>
                new CachedGroupRepository(
                    sp.GetRequiredService<GroupRepository>(),
                    sp.GetRequiredService<Microsoft.Extensions.Caching.Distributed.IDistributedCache>()));

            services.AddScoped<UserRepository>();
            services.AddScoped<IUserRepository>(sp =>
                new CachedUserRepository(
                    sp.GetRequiredService<UserRepository>(),
                    sp.GetRequiredService<IDistributedCache>()));

            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IReportRepository,ReportRepository>();
            services.AddScoped<IClassroomRepository,ClassroomRepository>(); 
            services.AddScoped<ITaskHistoryRepository, TaskHistoryRepository>();


            // Service
            services.AddScoped<ITokenGenerator, TokenGenerator>();
            services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
            return services;
        }

    }
    public static class AuthenticationInject
    {
        public static IServiceCollection AddAuthentication(this IServiceCollection services, IConfiguration config)
        {
            var jwtSettings = config.GetSection("Jwt");

            services.AddAuthentication(opt =>
            {
                opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(opt =>
                {
                    opt.MapInboundClaims = false;
                    opt.TokenValidationParameters = new TokenValidationParameters
                    {
                        RoleClaimType = "role",
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,

                        ValidIssuer = jwtSettings["Issuer"],
                        ValidAudience = jwtSettings["Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtSettings["Key"]!))
                    };
                    opt.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrWhiteSpace(accessToken) && path.StartsWithSegments("/hubs"))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });
                
            return services;
        }
    }
    public static class ExternalServiceInject
    {
        public static IServiceCollection AddExternalService(this IServiceCollection services, IConfiguration config)
        {
            // GIHUB
            services.AddHttpClient<IGithubOAuthService, GithubOauthService>();
            services.AddHttpClient<IGithubService, GithubService>();

            // GEMINI
            services.AddHttpClient<IGeminiService, GeminiService>();

            // PHOTO
            services.Configure<CloudinarySettings>(config.GetSection("Cloudinary"));
            services.AddScoped<IPhotoService, PhotoService>();

            // IMPORT EXCEL
            services.AddScoped<IExcelImportService, ExcelImportService>();

            // EMAIL 
            services.Configure<EmailConfiguration>(config.GetSection("EmailSettings"));
            services.AddScoped<IEmailService, EmailService>();

            // EXPORT PDF
            services.AddScoped<IReportService, ReportService>();

            // FiLE STORAGE
            services.Configure<FileStorageOptions>(config.GetSection(FileStorageOptions.SectionName));
            services.AddScoped<IFileStorageService, FileStorageService>();

            // TOKEN ENCRYPTION
            services.AddScoped<ITokenEncryptionService, TokenEncryptionService>();
            return services;
        }
    }
}
