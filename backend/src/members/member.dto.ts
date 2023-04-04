export class MemberDto {
  readonly email: string;
  readonly password?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly type: string;
  readonly birthday?: string;
}
