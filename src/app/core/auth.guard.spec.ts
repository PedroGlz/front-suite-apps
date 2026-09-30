import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('portal auth guard', () => {
  const auth = { me: vi.fn() };
  beforeEach(() => {
    auth.me.mockReset();
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: auth }] });
  });

  it('allows a valid backend session', () => {
    auth.me.mockReturnValue(of({ id: 'U1' }));
    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as never, {} as never);
      if (typeof result === 'boolean') throw new Error('Expected observable');
      (result as ReturnType<typeof of>).subscribe(value => expect(value).toBe(true));
    });
  });

  it('redirects to login when session is missing', () => {
    auth.me.mockReturnValue(throwError(() => ({ status: 401 })));
    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as never, {} as never);
      (result as ReturnType<typeof of>).subscribe(value => {
        expect(TestBed.inject(Router).serializeUrl(value as never)).toBe('/login');
      });
    });
  });
});
