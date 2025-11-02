Implementação, testes e demonstração do hook customizado `useEnhanceChildren`, responsável por
injetar ou mesclar props do componente pai em seus filhos — uma alternativa mais simples e prática
ao uso da Context API em cenários de componentes compostos.

### 🧩 Modos de operação

O hook pode ser utilizado de duas formas:

Modo Map (mapProps) — injeta props com base no displayName de cada componente (ex.: Card.Header,
Card.Body, Card.Footer).

Modo Broadcast (props) — injeta o mesmo conjunto de props em todos os filhos (exceto elementos HTML
nativos).

### ✨ Principais recursos

- TypeScript forte: overloads e união discriminada para os dois modos.
- Precedência correta: props passadas diretamente ao child sempre vencem as injetadas.
- Recursividade: percorre estruturas aninhadas de children.
- Ignora elementos HTML nativos (ex.: `div`, `span`).
- Identificação dos componentes filhos por `displayName`.
- Memoização via `useMemo` para evitar re-renderizações desnecessárias.

### 🧱 Stack utilizada

- React 19 + React DOM
- TypeScript 5.9
- Vite 7
- Vitest 4 + React Testing Library + `@testing-library/jest-dom`
- ESLint 9
- Tailwind CSS v4 (via `@tailwindcss/vite`)

### ⚡ Como executar

Pré‑requisitos: Node 20.19+.

Clone este repositório em sua máquina

```bash
git clone https://github.com/lucaspanizio/use-enhance-children.git
cd use-enhance-children
```

Faça a instalação das dependências

```bash
yarn install
```

Execute a aplicação em modo de desenvolvimento

```bash
yarn dev
```

Acesse http://localhost:5173 em seu navegador preferido.

### 🧪 Testes

Testes (execução única)

```bash
yarn test
```

Cobertura de testes

```bash
yarn coverage
```


### 🧠 API do hook

Local: `src/hooks/useEnhanceChildren.ts`

Contratos (resumo):

- Modo Map: `useEnhanceChildren(children, { mapProps })`
  - `mapProps`: objeto em que cada chave é um `displayName` e o valor são as props a serem injetadas
    naquele componente.
- Modo Broadcast: `useEnhanceChildren(children, { props })`
  - `props`: objeto de props a ser injetado em todos os children (não afeta elementos HTML nativos).

### 💡 Exemplos

#### Modo Map (por displayName)

```tsx
import { useEnhanceChildren } from './src/hooks/useEnhanceChildren';
import { Card } from './src/components/card';

function ExampleMap() {
  const children = (
    <>
      <Card.Header />
      <Card.Body />
      <Card.Footer />
    </>
  );

  const enhanced = useEnhanceChildren(children, {
    mapProps: {
      'Card.Header': { title: 'Título injetado' },
      'Card.Footer': { description: 'Descrição injetada' },
    },
  });

  return <div>{enhanced}</div>;
}
```

####  Modo Broadcast (para todos)

```tsx
import { useEnhanceChildren } from './src/hooks/useEnhanceChildren';
import { Card } from './src/components/card';

function ExampleBroadcast() {
  const children = (
    <>
      <Card.Header />
      <Card.Body />
      <Card.Footer />
    </>
  );

  const enhanced = useEnhanceChildren(children, {
    props: { title: 'Título', description: 'Descrição' },
  });

  return <section>{enhanced}</section>;
}
```

📘 Dica: para que o modo Map funcione corretamente, defina displayName nos componentes:

```tsx
function Header(props: { title?: string }) {
  /* ... */
}
Header.displayName = 'Card.Header';
```

#### 👨‍💻 Desenvolvido por José Lucas Panizio 🖖

[![Linkedin Badge](https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/lucaspanizio/)](https://www.linkedin.com/in/lucaspanizio/)
[![Gmail Badge](https://img.shields.io/badge/-Gmail-ff0000?style=flat-square&labelColor=ff0000&logo=gmail&logoColor=white&link=mailto:lucaspanizio@gmail.com)](mailto:lucaspanizio@gmail.com)
