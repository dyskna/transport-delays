using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Ride> Rides { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Verification> Verifications { get; set; }
        public DbSet<Journey> Journeys { get; set; }
        public DbSet<JourneySegment> JourneySegments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasMany(u => u.Reports)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Verifications)
                .WithOne(v => v.User)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Ride>()
                .HasMany(r => r.Reports)
                .WithOne(rp => rp.Ride)
                .HasForeignKey(rp => rp.RideId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Report>()
                .HasIndex(r => new { r.TransportType, r.LineNumber });

            modelBuilder.Entity<Verification>()
                .HasIndex(v => new { v.UserId, v.ReportId })
                .IsUnique(); // jeden użytkownik może głosować tylko raz na dane zgłoszenie

            modelBuilder.Entity<Verification>()
                .HasOne(v => v.Report)
                .WithMany(r => r.Verifications)
                .HasForeignKey(v => v.ReportId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Journey>()
    .HasMany(j => j.Segments)
    .WithOne(s => s.Journey)
    .HasForeignKey(s => s.JourneyId)
    .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<JourneySegment>()
                .HasOne(s => s.Ride)
                .WithMany()
                .HasForeignKey(s => s.RideId)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}
