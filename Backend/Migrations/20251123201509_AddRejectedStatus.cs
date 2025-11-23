using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartFixApi.Migrations
{
    public partial class AddRejectedStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Если Status - ENUM в C# или просто string, то для базы MySQL ничего менять не нужно,
            // просто обновляем логику приложения. Но если используешь ENUM в MySQL, то делаем ALTER:
            
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
