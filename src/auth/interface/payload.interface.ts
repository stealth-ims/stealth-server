export interface IUserPayload {
  sub: string;
  email: string;
  stamp: string;
  facility: string;
  department: string;
  role: string;
  permissions: string[];
  session: string;
}
