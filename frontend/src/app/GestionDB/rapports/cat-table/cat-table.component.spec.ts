import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatTableComponent } from './cat-table.component';

describe('CatTableComponent', () => {
  let component: CatTableComponent;
  let fixture: ComponentFixture<CatTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CatTableComponent]
    });
    fixture = TestBed.createComponent(CatTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
