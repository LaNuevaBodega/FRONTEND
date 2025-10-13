import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogProducto } from './dialog-producto';

describe('DialogProducto', () => {
  let component: DialogProducto;
  let fixture: ComponentFixture<DialogProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogProducto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogProducto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
