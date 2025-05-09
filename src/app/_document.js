import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnect to improve page load performance */}
          <link
            rel="preconnect"
            href="https://fonts.googleapis.com"
            crossOrigin="anonymous"
          />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          
          {/* Script to ensure authentication state is preserved as a cookie */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  if (typeof localStorage !== 'undefined') {
                    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
                    if (isAuthenticated) {
                      document.cookie = 'isAuthenticated=true; path=/; max-age=2592000';
                    } else if (localStorage.getItem('isAuthenticated') === null) {
                      localStorage.setItem('isAuthenticated', 'false');
                      document.cookie = 'isAuthenticated=false; path=/; max-age=2592000';
                    }
                  }
                } catch (e) {
                  console.error('Error setting auth cookie:', e);
                }
              `,
            }}
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
