import { TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { routeMeta } from './pages/[...not-found].page';
import { App } from './app';

describe('App', () => {
  const routes: Routes = [
    { path: '', children: [] },
    { path: '**', ...routeMeta }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideLocationMocks()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should redirect any unknown routes to the homepage', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    
    router.initialNavigation();
    await router.navigateByUrl('/invalid-route-path-test');
    
    expect(location.path()).toBe('/');
  });
});

