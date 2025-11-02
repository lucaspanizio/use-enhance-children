import type { ReactNode, ComponentPropsWithoutRef } from 'react';

import { useEnhanceChildren } from '@/hooks/useEnhanceChildren';

type CardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function Card({ children, ...props }: CardProps) {
  const enhancedChildren = useEnhanceChildren<CardProps>(children, {
    props,
  });

  return (
    <div
      data-testid="card"
      className="max-w-md mx-auto mt-10 bg-white dark:bg-slate-900 shadow-lg rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      {enhancedChildren}
    </div>
  );
}

type CardHeaderProps = ComponentPropsWithoutRef<'header'> & {
  title?: string;
};

Card.Header = Object.assign(
  ({ title, ...rest }: CardHeaderProps) => {
    return (
      <header
        data-testid="card-header"
        {...rest}
        className="bg-gray-50 dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-slate-200">
        {title}
      </header>
    );
  },
  { displayName: 'Card.Header' },
);

type CardBodyProps = ComponentPropsWithoutRef<'main'>;

Card.Body = Object.assign(
  ({ children, ...rest }: CardBodyProps) => {
    return (
      <main
        data-testid="card-body"
        {...rest}
        className="px-4 py-5 text-gray-800 dark:text-slate-100">
        {children}
      </main>
    );
  },
  { displayName: 'Card.Body' },
);

type CardFooterProps = ComponentPropsWithoutRef<'footer'> & {
  description?: string;
};

Card.Footer = Object.assign(
  ({ description, ...rest }: CardFooterProps) => {
    return (
      <footer
        data-testid="card-footer"
        {...rest}
        className="bg-gray-50 dark:bg-slate-800 px-4 py-3 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-slate-400">
        {description}
      </footer>
    );
  },
  { displayName: 'Card.Footer' },
);
