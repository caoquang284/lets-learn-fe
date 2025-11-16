import { Injectable } from '@angular/core';
import { LOCAL_STORAGE_KEYS } from '@shared/constants/local-storage-keys';
import {
  clearLocalStorageData,
  getLocalStorageData,
  setLocalStorageData,
} from '@shared/helper/local-storage.helper';
import { User } from '@shared/models/user';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(
    getLocalStorageData<User>(LOCAL_STORAGE_KEYS.USER)
  );
  public user$ = this.userSubject.asObservable();

  setUser(user: User) {
    setLocalStorageData<User>(LOCAL_STORAGE_KEYS.USER, user);
    this.userSubject.next(user);
  }

  getUser(): User | null {
    return this.userSubject.getValue();
  }

  clearUser() {
    clearLocalStorageData(LOCAL_STORAGE_KEYS.USER);
    this.userSubject.next(null);
  }

  updateUser(updates: Partial<User>) {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setUser(updatedUser);
    }
  }
}
