using project.Application.Interfaces;
using project.Infrastructure.Services.NotificationSignalr;
using project.Presentation.Signalr;

namespace project.Presentation.Dependencies
{
    public static class NotifcationInject
    {
        public static IServiceCollection AddNotificationService(this IServiceCollection services)
        {
            services.AddSignalR();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<INotificationHubService, NotificationHubService>();
            return services;
        }
    }
    public static class CorsInject
    {
        public static IServiceCollection AddCORS(this IServiceCollection services, IConfiguration config)
        {
            services.AddCors(opt =>
            {
                opt.AddPolicy("AllowedReactApp", policy =>
                {
                    var origins = config["Cors:Origins"]
                  ?.Split(",")
                  .Select(o => o.Trim())
                  .ToArray()
              ?? new[] { "http://localhost:5173" };
                    policy.WithOrigins(origins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });
            return services;
        }
    }
}
