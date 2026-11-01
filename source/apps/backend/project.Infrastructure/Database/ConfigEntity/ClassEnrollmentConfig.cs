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
    public class ClassEnrollmentConfig : IEntityTypeConfiguration<ClassEnrollment>
    {
        public void Configure(EntityTypeBuilder<ClassEnrollment> builder)
        {
            builder.ToTable("ClassEnrollment");

            builder.HasKey(x => x.Id);

            builder.Property(c => c.JoinedAt)
                .IsRequired();

            builder.Property(c => c.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(c => c.UserRole)
                .IsRequired()
                .HasConversion<string>();

            builder.HasOne(x => x.Classroom)
                .WithMany(x => x.Enrollments)
                .HasForeignKey(x => x.ClassroomId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.User)
                .WithMany(x => x.ClassEnrollments)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.ClassroomId, x.UserId })
                .IsUnique();

        }
    }
    public class ClassroomConfig : IEntityTypeConfiguration<Classroom>
    {
        public void Configure(EntityTypeBuilder<Classroom> builder)
        {
            builder.ToTable("ClassRoom");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.ClassName)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.SubjectName)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.ClassCode)
                .IsRequired()
                .HasMaxLength(8)
                .IsUnicode(false);

            builder.HasIndex(x => x.ClassCode)
                .IsUnique();

            builder.HasMany(x => x.Groups)
                .WithOne(x => x.Classroom)
                .HasForeignKey(x => x.ClassRoomId)
                .OnDelete(DeleteBehavior.Cascade); 

            builder.Property(x => x.MaxMembersPerGroup)
                .IsRequired();

            builder.HasOne(x => x.Teacher)
                .WithMany(x => x.OwnedClassrooms)
                .HasForeignKey(x => x.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.MajorType)
                .IsRequired()
                .HasConversion<string>();

   
        }
    }
}
