using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartFixApi.Migrations
{
    public partial class AddRejectedStatusSafe : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Если используешь ENUM в MySQL
            migrationBuilder.Sql(
                @"ALTER TABLE `RepairRequests` 
                  MODIFY COLUMN `Status` ENUM('New','InProgress','Ready','Closed','Rejected') NOT NULL;"
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"ALTER TABLE `RepairRequests` 
                  MODIFY COLUMN `Status` ENUM('New','InProgress','Ready','Closed') NOT NULL;"
            );
        }
    }
}
