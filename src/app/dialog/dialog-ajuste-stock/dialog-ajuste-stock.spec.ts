import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAjusteStock } from './dialog-ajuste-stock';

describe('DialogAjusteStock', () => {
  let component: DialogAjusteStock;
  let fixture: ComponentFixture<DialogAjusteStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAjusteStock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAjusteStock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
