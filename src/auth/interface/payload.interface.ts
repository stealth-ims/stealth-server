export interface IUserPayload {
  sub: string;
  email?: string;
  username: string;
  facility: string;
  department: string;
  role: string;
  permissions: string[];
  session: string;
}
