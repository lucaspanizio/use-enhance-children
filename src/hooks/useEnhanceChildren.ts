import type { ReactNode, ComponentType, PropsWithChildren } from 'react';
import React, { useMemo } from 'react';

type NamedComponent = ComponentType<unknown> & {
  displayName?: string;
};

/**
 * Hook para injetar props em elementos filhos de forma tipada e flexível.
 *
 * Oferece dois modos de operação:
 * 1. **Broadcast**: Injeta as mesmas props em todos os filhos
 * 2. **Map**: Injeta props específicas baseado no displayName de cada filho
 *
 * O hook processa recursivamente toda a árvore de children, aplicando as props
 * apropriadas sem sobrescrever as props que já existem no filho.
 *
 * @template M - Tipo do mapa de props por displayName (modo map)
 * @template P - Tipo das props para broadcast (modo broadcast)
 *
 * @param {ReactNode} children - Elementos React filhos a serem processados
 * @param {Object} [options.props] - Props para injetar em todos os filhos (modo broadcast)
 * @param {Record<string, object>} [options.mapProps] - Mapa de displayName para props específicas (modo map)
 *
 * @returns {ReactNode} Elementos filhos com as props injetadas
 *
 * @example
 * // Modo broadcast: mesmas props para todos os filhos
 * // Útil quando todos os filhos compartilham as mesmas props (ex: id, disabled, className, etc)
 * type CardProps = {
 *   title: string;
 *   description: string;
 *   children: ReactNode;
 * };
 *
 * const enhanced = useEnhanceChildren<CardProps>(children, {
 *   props: { title, description } // prop 'children' omitida automaticamente
 * });
 *
 * @example
 * // Modo map: props específicas por displayName
 * // Útil para compound components onde cada filho recebe props diferentes
 * type MapProps = {
 *   'Card.Header': { id: string; title: string };
 *   'Card.Body': { id: string; content: string };
 *   'Card.Footer': { id: string; description: string };
 * };
 *
 * const enhanced = useEnhanceChildren<MapProps>(children, {
 *   mapProps: {
 *     'Card.Header': { id: 'card-header', title: 'Hello World' },
 *     'Card.Body': { id: 'card-body', content: 'Lorem ipsum' },
 *     'Card.Footer': { id: 'card-footer', description: 'Footer text' }
 *   }
 * });
 *
 * @remarks
 * - Props injetadas têm prioridade MENOR que as props originais do filho
 * - Componentes precisam definir `displayName` para serem mapeados corretamente
 * - Fallback para `name` da função, mas `displayName` é recomendado em produção
 * - Processa recursivamente children aninhados
 * - Ignora elementos que não são React válidos (strings, números, null, etc)
 * - Ignora elementos HTML nativos (div, span, p, etc)
 */

// Sobrecarga 1: Modo map
export function useEnhanceChildren<M extends Record<string, object>>(
  children: ReactNode,
  options: { mapProps: M },
): ReactNode;

// Sobrecarga 2: Modo broadcast
export function useEnhanceChildren<P extends object>(
  children: ReactNode,
  options: { props: Omit<P, 'children'> },
): ReactNode;

// Implementação
export function useEnhanceChildren<T extends Record<string, object> | object>(
  children: ReactNode,
  options: { props: Omit<T, 'children'> } | { mapProps: T & Record<string, object> },
): ReactNode {
  return useMemo(() => {
    const enhance = (child: ReactNode): ReactNode => {
      if (!React.isValidElement(child)) return child;
      if (typeof child.type === 'string') return child;

      const type = child.type as NamedComponent;
      const childName = type?.displayName ?? '';
      const childProps = child.props as PropsWithChildren;

      const inheritedProps = 'mapProps' in options ? options.mapProps[childName] : options.props;

      // Mescla props herdadas com as props originais do filho
      if (inheritedProps && Object.keys(inheritedProps).length > 0) {
        return React.cloneElement(child, {
          ...inheritedProps,
          ...childProps,
        } as Partial<typeof childProps>);
      }

      // Processa recursivamente os children aninhados
      if (childProps?.children) {
        return React.cloneElement(child, {
          ...childProps,
          children: React.Children.map(childProps.children, enhance),
        } as Partial<typeof childProps>);
      }

      return child;
    };

    return React.Children.map(children, enhance);
  }, [children, options]);
}
