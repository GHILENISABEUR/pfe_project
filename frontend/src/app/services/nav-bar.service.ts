import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


interface NavBarButton {
  id: string;
  label: string;
  navbarId: string |null;  
}
@Injectable({
  providedIn: 'root'
})
export class NavBarService {
  private navBarButtonsStorageKey = 'navBarButtons';
  private navBarButtons: NavBarButton[] = this.getNavBarButtonsFromStorage();

  private activeNavBarSubject = new BehaviorSubject<string >("");
  activeNavBar$ = this.activeNavBarSubject.asObservable();
  private navBarBtnClickedSubject = new BehaviorSubject<boolean>(false);
  NavBarBtnClicked$ = this.navBarBtnClickedSubject.asObservable();
  private activeNavBarBtnSubject = new BehaviorSubject<string | null>(null);
  activeNavBarBtn$ = this.activeNavBarBtnSubject.asObservable();

  constructor() {}
  setActiveNavBar(id: string): void {
    this.activeNavBarSubject.next(id);
  }
  getActiveNavBar(): string {
    return this.activeNavBarSubject.getValue();
  }
  private getNavBarButtonsFromStorage(): NavBarButton[] {
    return JSON.parse(localStorage.getItem(this.navBarButtonsStorageKey) || '[]');
  }

  getNavBarButtons(): NavBarButton[] {
    return this.navBarButtons;
  }

  saveNavBarButtons(navBarButtons: NavBarButton[]): void {
    this.navBarButtons = navBarButtons;
    localStorage.setItem(this.navBarButtonsStorageKey, JSON.stringify(navBarButtons));
  }

  addNavBarButton(button: NavBarButton): void {
    this.navBarButtons.push(button);
    this.saveNavBarButtons(this.navBarButtons);
    console.log(`NavBarButton with ID ${button.id} added to service state.`);
  }

  updateNavBarButton(id: string, updates: Partial<NavBarButton>): void {
    if (!id) {
      console.error('No NavBar button ID provided.');
      return;
    }
  
    console.log('Attempting to update NavBar button with ID:', id, 'with updates:', updates);
  
    const index = this.navBarButtons.findIndex(button => button.id === id);
    
    if (index !== -1) {
      console.log('Found NavBar button at index:', index, 'Current button data:', this.navBarButtons[index]);
  
      // Update the button data
      this.navBarButtons[index] = {
        ...this.navBarButtons[index],
        ...updates
      };
  
      console.log('Updated button data:', this.navBarButtons[index]);
  
      // Save the updated buttons array to localStorage
      this.saveNavBarButtons(this.navBarButtons);
      console.log(`NavBarButton with ID ${id} updated in service state.`);
    } else {
      console.error(`NavBarButton with ID ${id} not found in service state.`);
    }
  }
  
  setNavBarBtnClicked(state: boolean): void {
    this.navBarBtnClickedSubject.next(state);
  }
  setActiveNavBarBtn(id: string | null): void {
    console.log('Setting active nav bar button:', id);
    this.activeNavBarBtnSubject.next(id);
  }

  getActiveNavBarBtn(): string | null {
    const id = this.activeNavBarBtnSubject.getValue();
    console.log('Getting active nav bar button:', id);
    return id;
  }
}

