import { MDXProvider } from '@mdx-js/react';
import { ReactNode } from 'react';
import mdxComponents from '@/components/mdx/MDXComponents';

interface MDXCustomProviderProps {
  children: ReactNode;
}

export default function MDXCustomProvider({ children }: MDXCustomProviderProps) {
  return (
    <MDXProvider components={mdxComponents}>
      {children}
    </MDXProvider>
  );
}