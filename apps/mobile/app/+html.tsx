import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0e0e0e" />
        <meta name="description" content="PHYGITAL-TRACE — Camera-to-Blockchain verification. Proof of Reality." />
        <title>PHYGITAL-TRACE | Proof of Reality</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: forensicAmberStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const forensicAmberStyles = `
body {
  background-color: #131313;
  color: #e5e2e1;
}
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;
