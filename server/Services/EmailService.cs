using System.Net;
using System.Net.Mail;
using System.Net.Sockets;

namespace server.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            Console.WriteLine("START SMTP TEST");

            try
            {
                var client = new TcpClient();
                await client.ConnectAsync("smtp.gmail.com", 587);
                Console.WriteLine("SMTP CONNECTION OK");
            }
            catch (Exception ex)
            {
                Console.WriteLine("SMTP CONNECTION FAILED: " + ex.Message);
            }

            Console.WriteLine("CONTINUING EMAIL SEND");

            var host = _config["Smtp:Host"]
                ?? throw new InvalidOperationException("Brak Smtp:Host w konfiguracji");

            var port = int.Parse(_config["Smtp:Port"]
                ?? throw new InvalidOperationException("Brak Smtp:Port w konfiguracji"));

            var username = _config["Smtp:Username"]
                ?? throw new InvalidOperationException("Brak Smtp:Username w konfiguracji");

            var password = _config["Smtp:Password"]
                ?? throw new InvalidOperationException("Brak Smtp:Password w konfiguracji");

            var enableSsl = bool.Parse(_config["Smtp:EnableSsl"]
                ?? throw new InvalidOperationException("Brak Smtp:EnableSsl w konfiguracji"));


            using var smtpClient = new SmtpClient(host)
            {
                Port = port,
                Credentials = new NetworkCredential(username, password),
                EnableSsl = enableSsl
            };

            using var mail = new MailMessage
            {
                From = new MailAddress(username, "Railert"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mail.To.Add(to);

            await smtpClient.SendMailAsync(mail);
        }
    }
}
