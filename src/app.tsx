import { useEffect, useState } from 'react';

import { Card } from '@/components/card';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="cursor-pointer px-3 py-1.5 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700"
          aria-pressed={theme === 'dark'}
          aria-label="Alternar tema">
          {theme === 'dark' ? 'Dark' : 'Light'} mode
        </button>
      </div>

      <Card title="Relatório de Vendas" description="Atualizado há 3 horas">
        <Card.Header />
        <Card.Body>
          <p>
            O total de vendas desta semana foi <strong>R$ 12.450,00</strong>.
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            Meta semanal atingida com sucesso 🎉
          </p>
        </Card.Body>
        <Card.Footer />
      </Card>
    </div>
  );
}
