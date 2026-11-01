using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using project.Application.Interfaces;
using project.Application.ModelsDto;
using project.Infrastructure.Exceptions;
using project.Infrastructure.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace project.Infrastructure.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly EmailConfiguration _emailconfig;

        public EmailService(IOptions<EmailConfiguration> emailconfig)
        {
            _emailconfig = emailconfig.Value ?? throw new ArgumentNullException(nameof(emailconfig));
        }

        public async Task SendEmail(Message msg)
        {
            var mimeMessage = new MimeMessage();
            mimeMessage.From.Add(new MailboxAddress("", _emailconfig.FromAddress));
            mimeMessage.To.AddRange(msg.To.Select(x => MailboxAddress.Parse(x)));
            mimeMessage.Subject = msg.Subject;
            mimeMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = msg.Body };

            using (var client = new SmtpClient())
            {
                try
                {
                    client.AuthenticationMechanisms.Remove("XOAUTH2");
                    await client.ConnectAsync(_emailconfig.SmtpServer, _emailconfig.Port, true);
                    await client.AuthenticateAsync(_emailconfig.Username, _emailconfig.Password);
                    await client.SendAsync(mimeMessage);
                }
                catch (SmtpCommandException e)
                {
                    throw new EmailSenderException("Error sending email", e);
                }
                finally
                {
                    await client.DisconnectAsync(true);
                }
            }
        }
    }
}
