using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Depedencies
{
    public static class InfrastructureInject
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
            {
            services
                .AddConnectionDatabase(config)
                .AddRepositories()
                .AddAuthentication(config)
                .AddMemoryCache()
                .AddRedisCache(config)
                .AddExternalService(config)
                .AddProtection(config);
            return services;
        }
    }
    public static class RedisInject
    {
        public static IServiceCollection AddRedisCache(this IServiceCollection services, IConfiguration config)
        {
            var connectionString = config.GetConnectionString("Redis");
            if (!string.IsNullOrWhiteSpace(connectionString))
            {
                services.AddStackExchangeRedisCache(options =>
                {
                    options.Configuration = connectionString;
                    options.InstanceName = "gh:";
                });
            }
            else
            {
                services.AddDistributedMemoryCache();
            }

            return services;
        }
    }
    public static class DataProtectionInject
    {
        public static IServiceCollection AddProtection(this  IServiceCollection services, IConfiguration config)
        {
            var keysPath = config["DataProtection:KeysPath"] ?? "DataProtectionKeys";
            services.AddDataProtection()
             .SetApplicationName("graduation-be")
             .PersistKeysToFileSystem(new DirectoryInfo(keysPath));

            return services;
        }
    }
}
