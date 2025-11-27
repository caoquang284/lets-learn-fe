import { FormControl } from '@angular/forms';
import { ComboboxOption } from '@shared/components/combobox/combobox.type';

export type UnpackedFormGroup<T> = {
  [K in keyof T]: T[K] extends FormControl<infer V> ? V : never;
};
export type UpdateOnType = 'change' | 'blur' | 'submit';
type ComponentType =
  | 'input'
  | 'select'
  | 'datetime'
  | 'checkbox'
  | 'file-upload'
  | 'button'
  | 'richtext';

export interface FormControlField {
  id: string;
  label: string;
  type: string;
  componentType: ComponentType;
  placeholder: string;
  options?: ComboboxOption[];
  descriptionOnOption?: Record<string, string>;
  description?: string;
  icon?: string;
  validationMessages: { [key: string]: string } | null;
  onClick?: () => void;
  note?: string;
  buttonText?: string;
  buttonColor?: string;
}
