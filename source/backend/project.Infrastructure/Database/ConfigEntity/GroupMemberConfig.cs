using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using project.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Database.ConfigEntity
{
    public class GroupMemberConfig : IEntityTypeConfiguration<GroupMem>
    {
        public void Configure(EntityTypeBuilder<GroupMem> builder)
        {
            builder.ToTable("GroupMembers");

            builder.HasKey(gm => gm.Id);

            builder.Property(gm => gm.Role)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(gm => gm.JoinedAt)
                .IsRequired();

            // Unique: mỗi user chỉ tham gia 1 lần trong 1 nhóm
            builder.HasIndex(gm => new { gm.GroupId, gm.UserId })
                .IsUnique();

            builder.HasOne(gm => gm.User)
                .WithMany(u => u.GroupMembers)
                .HasForeignKey(gm => gm.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
