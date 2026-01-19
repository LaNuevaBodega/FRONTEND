import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAbrirCaja } from './dialog-abrir-caja';

describe('DialogAbrirCaja', () => {
  let component: DialogAbrirCaja;
  let fixture: ComponentFixture<DialogAbrirCaja>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAbrirCaja]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAbrirCaja);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
