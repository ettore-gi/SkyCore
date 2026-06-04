import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCanvasMapComponent } from './test-canvas-map.component';

describe('TestCanvasMapComponent', () => {
  let component: TestCanvasMapComponent;
  let fixture: ComponentFixture<TestCanvasMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCanvasMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestCanvasMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
