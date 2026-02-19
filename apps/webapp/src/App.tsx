import { AppRouting } from '@/routing/app-routing';
import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/query-provider';
import { LayoutSwitcherProvider } from '@/providers/layout-switcher-provider';
import { AuthProvider } from '@/providers/auth-provider';

const { BASE_URL } = import.meta.env;

export function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="vite-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <HelmetProvider>
        <LoadingBarContainer>
          <BrowserRouter basename={BASE_URL}>
            <QueryProvider>
              <LayoutSwitcherProvider>
                <AuthProvider>
                  <Toaster />
                  <AppRouting />
                </AuthProvider>
              </LayoutSwitcherProvider>
            </QueryProvider>
          </BrowserRouter>
        </LoadingBarContainer>
      </HelmetProvider>
    </ThemeProvider>
  );
}
