import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

interface ElementData {
  id: string;
  idframe: string |null;
  type: string;
  content: string;
  style: string | null;
}

interface FrameData {
  id: string;
  key: string;
  title: string;
  event: string;
  content: string;
  route: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private elementsStorageKey = 'frameElements';
  private framesStorageKey = 'frames';
  private framesList=[];
  private frameClickedSubject = new BehaviorSubject<boolean>(false);
  frameClicked$ = this.frameClickedSubject.asObservable();
  private openSettingsSubject = new BehaviorSubject<boolean>(false);
  openSettings$ = this.openSettingsSubject.asObservable();

  private openSettingsInputSubject = new BehaviorSubject<boolean>(false);
  openSettingsInput$ = this.openSettingsInputSubject.asObservable();

  private openSettingsNavBarSubject = new BehaviorSubject<boolean>(false);
  openSettingsNavBar$ = this.openSettingsNavBarSubject.asObservable();

  private activeElementSource = new Subject<any>();
  activeElement$ = this.activeElementSource.asObservable();

  private elements: ElementData[] = this.getElementsFromStorage();
  private frames: FrameData[] = this.getFramesFromStorage();

  private activeFrameSubject = new BehaviorSubject<string | null>(null);
  activeFrame$ = this.activeFrameSubject.asObservable();
  
  private buttonClickedSubject = new BehaviorSubject<boolean>(false);
  buttonClicked$ = this.buttonClickedSubject.asObservable();
  
  private selectedActionSubject = new BehaviorSubject<string>('');
  selectedAction$ = this.selectedActionSubject.asObservable();

  private openFormFrameEditSubject = new BehaviorSubject<boolean>(false);
  openFormFrameEdit$ = this.openFormFrameEditSubject.asObservable();
  private framesSubject: BehaviorSubject<FrameData[]> = new BehaviorSubject<FrameData[]>([]);
  public frames$: Observable<FrameData[]> = this.framesSubject.asObservable();
  private webSiteId: string | null = null;

  constructor() {const frames = JSON.parse(localStorage.getItem('frames') || '[]');
    this.framesSubject.next(frames);}

  setOpenSettings(value: boolean) {
    this.openSettingsSubject.next(value);
  }

  setOpenSettingsInput(value: boolean) {
    this.openSettingsInputSubject.next(value);
  }
  setOpenSettingsNavBar(value: boolean) {
    this.openSettingsNavBarSubject.next(value);
  }

  private getElementsFromStorage(): ElementData[] {
    return JSON.parse(localStorage.getItem(this.elementsStorageKey) || '[]');
  }

  private getFramesFromStorage(): FrameData[] {
    return JSON.parse(localStorage.getItem(this.framesStorageKey) || '[]');
  }

  getElements(): ElementData[] {
    return this.elements;
  }

  getFrames(): FrameData[] {
    return this.framesSubject.getValue();
  }

  saveElements(elements: ElementData[]): void {
    this.elements = elements;
    localStorage.setItem(this.elementsStorageKey, JSON.stringify(elements));
  }

  saveFrames(frames: FrameData[]): void {
    this.frames = frames;
    localStorage.setItem(this.framesStorageKey, JSON.stringify(frames));
  }

  setActiveElement(element: any) {
    this.activeElementSource.next(element);
  }

  removeElement(id: string) {
    const index = this.elements.findIndex(element => element.id === id);
    if (index !== -1) {
      this.elements.splice(index, 1);
      this.saveElements(this.elements);
      console.log(`Element with ID ${id} removed from service state.`);
    } else {
      console.error(`Element with ID ${id} not found in service state.`);
    }
  }

  removeFrame(id: string) {
    const index = this.frames.findIndex(frame => frame.id === id);
    if (index !== -1) {
      this.frames.splice(index, 1);
      this.saveFrames(this.frames);
      console.log(`Frame with ID ${id} removed from service state.`);
    } else {
      console.error(`Frame with ID ${id} not found in service state.`);
    }
  }

  updateElement(id: string, updates: any): void {
    const index = this.elements.findIndex(element => element.id === id);
    if (index !== -1) {
      const element = this.elements[index];    
      Object.assign(element, updates);
      this.saveElements(this.elements);
      console.log(`Element with ID ${id} updated in service state.`);
    } else {
      console.error(`Element with ID ${id} not found in service state.`);
    }
  }

  updateFrame(id: string, updates: Partial<FrameData>): void {
    const frames = this.getFrames();
    const index = frames.findIndex(frame => frame.key === id);
    if (index !== -1) {
      Object.assign(frames[index], updates);
      this.setFrames(frames);
    }
  }

  addElement(element: ElementData): void {
    this.elements.push(element);
    this.saveElements(this.elements);
    console.log(`Element with ID ${element.id} added to service state.`);
    console.log(localStorage);
  }

  addFrame(frame: FrameData): void {
    this.frames.push(frame);
    this.saveFrames(this.frames);
    console.log(`Frame with ID ${frame.id} added to service state.`);
  }

  clearStorage(): void {
    this.elements = [];
    this.frames = [];
    localStorage.removeItem(this.elementsStorageKey);
    localStorage.removeItem(this.framesStorageKey);
    console.log('Local storage and elements cleared.');
  }

  setButtonClicked(value: boolean) {
    this.buttonClickedSubject.next(value);
  }

  setSelectedAction(value: string) {
    this.selectedActionSubject.next(value);
  }

  setOpenFormFrameEdit(value: boolean) {
    this.openFormFrameEditSubject.next(value);
  }

  
  setActiveFrame(id: string): void {
    this.activeFrameSubject.next(id);
  }

  getActiveFrame(): string | null {
    return this.activeFrameSubject.getValue();
  }

  TS_GetFramesFromLocalStorage() {
    const storedFrames = localStorage.getItem('framesList');
    if (storedFrames) {
      this.framesList = JSON.parse(storedFrames);
    } else {
      this.framesList = []; 
    }
  }
  setFrameClicked(value: boolean): void {
    this.frameClickedSubject.next(value);
  }

  isFrameClicked(): boolean {
    return this.frameClickedSubject.getValue();
  }
  setFrames(frames: FrameData[]): void {
    localStorage.setItem('frames', JSON.stringify(frames));
    this.framesSubject.next(frames);
  }
  setWebSiteId(id: string): void {
    this.webSiteId = id;
  }

  getWebSiteId(): string | null {
    return this.webSiteId;
  }
}
