using Microsoft.Extensions.Hosting;
using server.Data;

namespace server.Services
{
    public class JourneyBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public JourneyBackgroundService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var journeyService = new JourneyService(context);

                await journeyService.CheckConnectionsAsync();

                //  sprawdzaj co 1 minute
                await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
            }
        }
    }
}
