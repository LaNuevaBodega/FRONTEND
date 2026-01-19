import { TestBed } from '@angular/core/testing';

import { MetodoDePagoService } from './metodo-de-pago-service';

describe('MetodoDePagoService', () => {
  let service: MetodoDePagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetodoDePagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
