import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideFileRouter, requestContextInterceptor } from '@analogjs/router';
import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { withPrismHighlighter } from '@analogjs/content/prism-highlighter';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { OPTIMIZED_IMAGES } from './pages/optimized-images';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideFileRouter(),
    provideHttpClient(
      withFetch(),
      withInterceptors([requestContextInterceptor])
    ),
    provideClientHydration(withEventReplay()),
    provideContent(withMarkdownRenderer(), withPrismHighlighter()),
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        if (config.src.startsWith('http') || config.src.startsWith('//')) {
          return config.src;
        }
        let src = config.src;
        if (src.startsWith('/')) {
          src = src.slice(1);
        }

        // Normalize path to match OPTIMIZED_IMAGES manifest keys
        let manifestKey = src;
        if (!manifestKey.startsWith('images/')) {
          manifestKey = 'images/' + manifestKey;
        }

        const availableWidths = Object.prototype.hasOwnProperty.call(OPTIMIZED_IMAGES, manifestKey)
          ? OPTIMIZED_IMAGES[manifestKey]
          : undefined;

        // Strip directories for constructing the local public file path
        let fileSrc = src;
        if (fileSrc.startsWith('images/')) {
          fileSrc = fileSrc.slice('images/'.length);
        } else if (fileSrc.startsWith('public/images/')) {
          fileSrc = fileSrc.slice('public/images/'.length);
        }

        const lastDot = fileSrc.lastIndexOf('.');
        let base = fileSrc;
        let ext = '';
        if (lastDot !== -1) {
          base = fileSrc.substring(0, lastDot);
          ext = fileSrc.substring(lastDot);
        }
        const finalExt = ext === '.jpg' || ext === '.jpeg' ? '.webp' : ext;

        // Only return a width-suffixed variant if it was actually generated in the manifest
        if (config.width && availableWidths && availableWidths.length > 0) {
          const width = config.width;
          if (availableWidths.includes(width)) {
            return `/images/${base}-${width}w${finalExt}`;
          }
          // Fall back to the closest available width >= requested, or the largest available
          const bestWidth = availableWidths.find(w => w >= width) || availableWidths[availableWidths.length - 1];
          return `/images/${base}-${bestWidth}w${finalExt}`;
        }

        // Fall back to the default optimized WebP image
        return `/images/${base}${finalExt}`;
      }
    }
  ],
};

