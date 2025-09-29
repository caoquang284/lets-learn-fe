import { DELETE, GET, PATCH, PUT } from '@shared/api/utils.api';
import { convertUserWorkFromResponseData } from '@shared/helper/user.api.helper';
import { User } from '@shared/models/user';

export const GetProfile = (): Promise<User> => {
  return GET('/user/me');
};

export const GetAllUsers = (): Promise<User[]> => {
  return GET('/user/all');
};

export const UpdateProfile = (
  username: string,
  avatar: string
): Promise<User> => {
  const data = {
    username,
    avatar,
  };
  return PUT('/user/me', data);
};

export const UpdatePassword = (
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  const data = {
    oldPassword,
    newPassword,
  };
  return PATCH('/user/me/password', data);
};

export const LeaveCourse = (courseId: string): Promise<void> => {
  return DELETE(`/user/leave?courseId=${courseId}`);
};

//Get working topics of user
export const GetUserWork = (type: 'quiz' | 'assignment' | 'meeting') => {
  return GET(`/user/work?type=${type}`).then(convertUserWorkFromResponseData);
};

//Get all working topics of user with optional start and end date
export const GetAllWorkingTopicsOfUser = (start?: string, end?: string) => {
  const url =
    start && end ? `/user/work?start=${start}&end=${end}` : '/user/work';
  return GET(url).then(convertUserWorkFromResponseData);
};
