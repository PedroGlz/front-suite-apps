import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PortalApi } from '../../core/portal.api';
import { AppsPage } from './apps';

describe('Mis aplicaciones', () => {
  it('shows only applications returned by authorized backend endpoint', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PortalApi, useValue: {
      apps: () => of([{ id: 'A1', code: 'ETIC', name: 'ETIC', latestVersion: null }])
    } }] });
    const page = TestBed.runInInjectionContext(() => new AppsPage());
    expect(page.apps().map(app => app.id)).toEqual(['A1']);
    expect(page.loading()).toBe(false);
  });

  it('shows denied access when the backend rejects an inactive user', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PortalApi, useValue: {
      apps: () => throwError(() => ({ status: 403 }))
    } }] });
    const page = TestBed.runInInjectionContext(() => new AppsPage());
    expect(page.apps()).toEqual([]);
    expect(page.error()).toContain('no está activo');
  });
});
