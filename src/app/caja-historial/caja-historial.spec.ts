import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaHistorial } from './caja-historial';

describe('CajaHistorial', () => {
  let component: CajaHistorial;
  let fixture: ComponentFixture<CajaHistorial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaHistorial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaHistorial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
