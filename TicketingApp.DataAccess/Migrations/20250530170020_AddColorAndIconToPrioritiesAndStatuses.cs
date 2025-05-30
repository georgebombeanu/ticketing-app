using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TicketingApp.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddColorAndIconToPrioritiesAndStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "TicketStatus",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Icon",
                table: "TicketStatus",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "TicketPriorities",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Icon",
                table: "TicketPriorities",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Color",
                table: "TicketStatus");

            migrationBuilder.DropColumn(
                name: "Icon",
                table: "TicketStatus");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "TicketPriorities");

            migrationBuilder.DropColumn(
                name: "Icon",
                table: "TicketPriorities");
        }
    }
}
