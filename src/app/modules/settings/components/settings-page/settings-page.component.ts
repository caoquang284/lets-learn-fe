import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { TabService } from '@shared/components/tab-list/tab-list.service';
import { 
  SettingsTab,
  SETTINGS_TABS,
  SETTINGS_TAB_LABELS
} from '@modules/settings/contants/settings.contants';
import { User } from '@shared/models/user';
import { UserService } from '@shared/services/user.service';
@Component({
  selector: 'settings-page',
  standalone: false,
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  providers: [TabService]
})
export class SettingsPageComponent implements OnInit {
  readonly SettingsTab = SettingsTab;
  user: User | null = null;
  tabs: string[] = SETTINGS_TAB_LABELS;
  selectedTab: string = 'Profile';

  constructor(
    private breadcrumbService: BreadcrumbService,
    public tabService: TabService<string>,
    private userService: UserService
  ) {
    this.breadcrumbService.setBreadcrumbs([
      {
        label: 'Settings',
        url: '/settings',
        active: true,
      },
    ]);
    this.tabService.setTabs(this.tabs);
    this.tabService.selectTab(this.selectedTab);
  }
  ngOnInit(): void {
    this.user = this.userService.getUser();
    
    this.tabService.selectedTab$.subscribe((tab) => {
      if (tab) this.selectedTab = tab;
    });
    
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });
  }
  
  onTabChange(tab: SettingsTab): void {
    this.tabService.selectTab(tab);
  }
}
