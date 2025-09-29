import { GET, POST, PUT } from '@shared/api/utils.api';
import { Section } from '@shared/models/course';
import {
  convertSectionToCreateRequestData,
  convertSectionToUpdateRequestData,
} from '../helper/section.api.helper';

export const GetSection = (id: string): Promise<Section> => {
  return GET(`/section/${id}`);
};

export const CreateSection = (section: Section): Promise<Section> => {
  const data = convertSectionToCreateRequestData(section);
  return POST('/section', data);
};

export const UpdateSection = (section: Section): Promise<Section> => {
  let data = convertSectionToUpdateRequestData(section);
  console.log('UpdateSection data: ', data);
  return PUT(`/section/${section.id}`, data);
};
