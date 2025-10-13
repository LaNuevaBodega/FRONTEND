import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogProveedor } from './dialog-proveedor';

describe('DialogProveedor', () => {
  let component: DialogProveedor;
  let fixture: ComponentFixture<DialogProveedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogProveedor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogProveedor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
