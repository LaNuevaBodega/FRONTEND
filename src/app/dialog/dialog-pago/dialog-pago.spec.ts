import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPago } from './dialog-pago';

describe('DialogPago', () => {
  let component: DialogPago;
  let fixture: ComponentFixture<DialogPago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogPago]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogPago);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
