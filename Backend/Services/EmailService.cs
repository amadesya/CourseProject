using System.Net;
using System.Net.Mail;

namespace SmartFixApi.Services;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtp = new SmtpClient
        {
            Host = _config["Smtp:Host"]!,
            Port = int.Parse(_config["Smtp:Port"]),
            EnableSsl = true,
            Credentials = new NetworkCredential(
                _config["Smtp:User"],
                _config["Smtp:Pass"])
        };

        var message = new MailMessage
        {
            From = new MailAddress(_config["Smtp:User"], "SmartFix"),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        message.To.Add(to);

        await smtp.SendMailAsync(message);
    }
}
