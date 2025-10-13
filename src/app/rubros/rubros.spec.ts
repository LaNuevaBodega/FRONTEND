import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rubros } from './rubros';

describe('Rubros', () => {
  let component: Rubros;
  let fixture: ComponentFixture<Rubros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rubros]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rubros);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
