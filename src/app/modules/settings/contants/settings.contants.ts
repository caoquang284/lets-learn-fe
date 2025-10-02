export enum SettingsTab {
    PROFILE = 'Profile',
    PASSWORD = 'Password',
}

export const SETTINGS_TABS = [SettingsTab.PROFILE, SettingsTab.PASSWORD];
export const SETTINGS_TAB_LABELS = SETTINGS_TABS.map(tab => tab.toString());