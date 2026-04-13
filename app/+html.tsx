import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * PWA HTML document template for Rate.
 * This file only renders on web. It customizes the <head> injected by Expo Router.
 * Native platforms ignore this file entirely.
 *
 * Expo Router docs: https://docs.expo.dev/router/reference/api-routes/#html
 */
export default function Root({ children }: PropsWithChildren): React.ReactElement {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* App identity */}
        <title>Rate.</title>
        <meta
          name="description"
          content="Puntúa, descubre y comparte lo que ves, lees, juegas y escuchas."
        />

        {/* PWA manifest — Android installability */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />

        {/* iOS Safari PWA — standalone mode */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rate." />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* Expo reset styles — required for React Native Web layout */}
        <ScrollViewStyleReset />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
