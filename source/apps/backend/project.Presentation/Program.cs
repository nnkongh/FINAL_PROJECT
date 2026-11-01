using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using project.Application.Dependency;
using project.Application.Interfaces;
using project.Domain.Models;
using project.Infrastructure.Database;
using project.Infrastructure.Depedencies;
using project.Presentation.Dependencies;
    using project.Presentation.Middleware;
using project.Presentation.Signalr;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Threading.RateLimiting;

namespace project.Presentation
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers()
                .AddJsonOptions(opt => opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
            builder.Services.AddApplicationService();
            builder.Services.AddInfrastructure(builder.Configuration);

            builder.Services.AddCORS(builder.Configuration);
            builder.Services.AddNotificationService();
            builder.Services.AddMemoryCache();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddRateLimiter(options =>
            {
                options.AddPolicy("LoginPolicy", context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 5,
                            Window = TimeSpan.FromMinutes(1),
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = 0
                        }));
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            });

            builder.Services.AddScoped<DataSeeder>();
            var app = builder.Build();

            // Configure the HTTP request pipeline.
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.Database.Migrate();

                var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
                await seeder.SeedAsync();

            }
            app.UseGlobalExceptionMiddleware();
            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseRouting();
            app.UseCors("AllowedReactApp");
            app.UseRateLimiter();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapHub<NotificationHub>("/hubs/notification");
            app.MapControllers();

            app.Run();
        }
    }
}
