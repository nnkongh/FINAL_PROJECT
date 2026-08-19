using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace project.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class createaccesstoken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GithubAccessToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GithubAccessToken",
                table: "Users");
        }
    }
}
