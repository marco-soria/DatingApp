import { HttpEvent, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, finalize, of, tap } from 'rxjs';
import { BusyService } from '../services/busy-service';

const cache = new Map<string, HttpEvent<unknown>>();

// Función para invalidar cache selectivo por patrón de URL
export const invalidateCache = (urlPattern?: string) => {
  if (!urlPattern) {
    // Si no se proporciona patrón, limpiar todo el cache
    cache.clear();
    console.log('Cache cleared completely');
    return;
  }

  // Invalidar solo las entradas que coinciden con el patrón
  for (const key of cache.keys()) {
    if (key.includes(urlPattern)) {
      cache.delete(key);
      console.log(`Cache invalidated for: ${key}`);
    }
  }
};

// Función para limpiar todo el cache (alias para mayor claridad)
export const clearCache = () => invalidateCache();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  const generateCacheKey = (url: string, params: HttpParams): string => {
    const paramString = params
      .keys()
      .map((key) => `${key}=${params.get(key)}`)
      .join('&');
    return paramString ? `${url}?${paramString}` : url;
  };

  const cacheKey = generateCacheKey(req.url, req.params);

  if (req.method.includes('POST') && req.url.includes('/likes')) {
    invalidateCache('/likes');
  }

  if (req.method.includes('POST') && req.url.includes('/messages')) {
    invalidateCache('/messages');
  }

  if (req.method.includes('POST') && req.url.includes('/logout')) {
    cache.clear();
  }

  if (req.method === 'GET') {
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }
  }

  busyService.busy();

  return next(req).pipe(
    delay(500),
    tap((response) => {
      cache.set(cacheKey, response);
    }),
    finalize(() => {
      busyService.idle();
    })
  );
};
