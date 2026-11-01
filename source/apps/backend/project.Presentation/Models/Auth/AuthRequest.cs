namespace project.Presentation.Models.Auth
{
    public record ForgotPasswordRequest(string Email, string ClientUri);
    public record LoginRequest(string MSSV, string Password);
    public record ResetPasswordRequest(string Email, string Token, string NewPassword, string PasswordConfirm);
    public record ChangePasswordRequest(string OldPassword, string NewPassword, string PasswordConfirm);
    public record TokenRequest(string AccessToken, string RefreshToken);
    public record LinkGithubRequest(string email);

}
