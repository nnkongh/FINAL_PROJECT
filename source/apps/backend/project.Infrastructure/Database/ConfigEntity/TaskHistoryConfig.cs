using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Database.ConfigEntity
{
    public class TaskHistoryConfig : IEntityTypeConfiguration<TaskHistory>
    {
        public void Configure(EntityTypeBuilder<TaskHistory> builder)
        {
            builder.ToTable("TaskHistory");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.OldStatus)
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.NewStatus)
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.ChangedAt)
                .IsRequired();

            builder.Property(x => x.ChangedBy)
                .IsRequired();

            builder.Property(x => x.TaskId)
                .IsRequired();

            builder.HasOne(t => t.Task)
                .WithMany(h => h.History)
                .HasForeignKey(t => t.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.ChangedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
