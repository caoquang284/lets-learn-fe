import { GET, POST } from '@shared/api/utils.api';
import { Role } from '@shared/models/user';

export const Login = (email: string, password: string) => {
  const data = {
    email,
    password,
  };
  return POST('/auth/login', data);
};

export const SignUp = (
  username: string,
  email: string,
  password: string,
  role: Role
) => {
  const data = {
    username,
    email,
    password,
    role,
  };
  return POST('/auth/signup', data);
};

export const RefreshToken = () => {
  return GET('/auth/refresh');
};

export const Logout = () => {
  return POST('/auth/logout');
};
