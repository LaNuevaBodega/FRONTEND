import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Condicioniva } from './condicioniva';

describe('Condicioniva', () => {
  let component: Condicioniva;
  let fixture: ComponentFixture<Condicioniva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Condicioniva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Condicioniva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
