import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PortalApi } from './portal.api';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('Portal API', () => {
  let http: HttpTestingController;
  let api: PortalApi;
  let auth: AuthService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(PortalApi);
    auth = TestBed.inject(AuthService);
  });
  afterEach(() => http.verify());

  it('uses the existing session login and logout', () => {
    auth.login('user', 'password').subscribe();
    const login = http.expectOne(`${environment.apiBaseUrl}/api/auth/login`);
    expect(login.request.withCredentials).toBe(true);
    expect(login.request.body).toEqual({ username: 'user', password: 'password' });
    login.flush({ id: 'U1', username: 'user', name: 'User', groupName: 'Usuarios' });
    auth.logout().subscribe();
    const logout = http.expectOne(`${environment.apiBaseUrl}/api/auth/logout`);
    expect(logout.request.withCredentials).toBe(true);
    logout.flush(null);
    expect(auth.user()).toBeNull();
  });

  it('requests only portal data with credentials', () => {
    api.apps().subscribe();
    const list = http.expectOne(`${environment.apiBaseUrl}/api/portal/apps`);
    expect(list.request.withCredentials).toBe(true);
    list.flush([]);
    api.download('V1').subscribe();
    const download = http.expectOne(`${environment.apiBaseUrl}/api/portal/downloads/V1`);
    expect(download.request.withCredentials).toBe(true);
    expect(download.request.responseType).toBe('blob');
    download.flush(new Blob());
  });
});
