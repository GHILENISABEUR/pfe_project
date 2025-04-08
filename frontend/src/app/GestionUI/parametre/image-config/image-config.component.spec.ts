import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageConfigComponent } from './image-config.component';

describe('ImageConfigComponent', () => {
  let component: ImageConfigComponent;
  let fixture: ComponentFixture<ImageConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageConfigComponent]
    });
    fixture = TestBed.createComponent(ImageConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
