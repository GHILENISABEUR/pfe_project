import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGAdressComponent } from './user-g-adress.component';  

describe('UserGAdressComponent', () => {
  let component: UserGAdressComponent;
  let fixture: ComponentFixture<UserGAdressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserGAdressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserGAdressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
