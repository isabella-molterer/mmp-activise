export class ResetPasswordDto {
  readonly email: string;
  readonly newPassword: string;
  readonly currentPassword?: string;
  readonly newPasswordToken?: string; // only available if user has forgotten password
  readonly type: string;
}
