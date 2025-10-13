import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRubro } from './dialog-rubro';

describe('DialogRubro', () => {
  let component: DialogRubro;
  let fixture: ComponentFixture<DialogRubro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogRubro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogRubro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
