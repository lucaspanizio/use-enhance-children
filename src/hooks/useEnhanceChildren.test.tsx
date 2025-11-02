import type { ReactNode } from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { Card } from '@/components/card';
import { useEnhanceChildren } from './useEnhanceChildren';

type Props = {
  title: string;
  description?: string;
};

type MapProps = {
  'Card.Header': { title?: string };
  'Card.Footer': { description?: string };
};

// Test helpers
const createMapWrapper = <M extends Record<string, Record<string, unknown>> = MapProps>(
  mapProps: M,
) => {
  return ({ children }: { children: ReactNode }) => {
    const enhanced = useEnhanceChildren<M>(children, { mapProps });
    return <div>{enhanced}</div>;
  };
};

const createBroadcastWrapper = <P extends Record<string, unknown> = Props>(
  props: Omit<P, 'children'>,
) => {
  return ({ children }: { children: ReactNode }) => {
    const enhanced = useEnhanceChildren<P>(children, { props });
    return <div>{enhanced}</div>;
  };
};

const expectNativeElementNotInjected = (element: Element | null, expectedText: string) => {
  expect(element).toHaveTextContent(expectedText);
  expect(element).not.toHaveAttribute('title');
  expect(element).not.toHaveAttribute('description');
};

describe('useEnhanceChildren', () => {
  describe('Modo Map (mapProps)', () => {
    it('deve processar múltiplos componentes corretamente', () => {
      const Wrapper = createMapWrapper({
        'Card.Header': { title: 'Main Title' },
        'Card.Footer': { description: 'Main Description' },
      });

      const { getByTestId, container } = render(
        <Wrapper>
          <Card.Header />
          <Card.Body>Content here</Card.Body>
          <Card.Footer />
        </Wrapper>,
      );

      expect(getByTestId('card-header')).toHaveTextContent('Main Title');
      expect(getByTestId('card-footer')).toHaveTextContent('Main Description');
      expect(container).toHaveTextContent('Content here');
    });

    it('não deve injetar props em elementos HTML nativos', () => {
      const Wrapper = createMapWrapper<Pick<MapProps, 'Card.Header'>>({
        'Card.Header': { title: 'Test Title' },
      });

      const { getByTestId } = render(
        <Wrapper>
          <div data-testid="native-div">Native Div</div>
          <Card.Header />
        </Wrapper>,
      );

      const nativeDiv = getByTestId('native-div');
      expectNativeElementNotInjected(nativeDiv, 'Native Div');
      expect(getByTestId('card-header')).toHaveTextContent('Test Title');
    });

    it('não deve injetar props em componentes sem displayName', () => {
      const Wrapper = createMapWrapper({
        'Card.Header': { title: 'Test Title' },
      });

      const WithoutDisplayNameComponent = () => (
        <div data-testid="without-display-name">Without Display Name Component</div>
      );

      const { getByTestId } = render(
        <Wrapper>
          <WithoutDisplayNameComponent />
          <Card.Header />
        </Wrapper>,
      );

      const withoutDisplayNameComponent = getByTestId('without-display-name');

      expect(withoutDisplayNameComponent).not.toHaveAttribute('title');
      expect(withoutDisplayNameComponent).toHaveTextContent('Without Display Name Component');
      expect(getByTestId('card-header')).toHaveTextContent('Test Title');
    });

    it('não deve injetar props em componentes com displayName incorreto', () => {
      const Wrapper = createMapWrapper({
        Header: { title: 'Test Title' },
      });

      const { getByTestId } = render(
        <Wrapper>
          <Card.Header />
        </Wrapper>,
      );

      const cardHeader = getByTestId('card-header');

      expect(cardHeader).not.toHaveAttribute('title');
      expect(cardHeader).not.toHaveTextContent('Test Title');
    });

    it('deve processar recursivamente children aninhados', () => {
      const Wrapper = createMapWrapper({
        'Card.Header': { title: 'Parent Title' },
      });

      const { getByTestId } = render(
        <Wrapper>
          <Card.Body>
            <Card.Header />
          </Card.Body>
        </Wrapper>,
      );

      expect(getByTestId('card-header')).toHaveTextContent('Parent Title');
    });

    it('deve manter a ordem dos children após processamento', () => {
      const Wrapper = createMapWrapper({} as MapProps);

      const { container } = render(
        <Wrapper>
          <Card.Header data-marker="header" />
          <Card.Body data-marker="body">Middle</Card.Body>
          <Card.Footer data-marker="footer" />
        </Wrapper>,
      );

      const markers = container.querySelectorAll('[data-marker]');
      const order = Array.from(markers).map((el) => el.getAttribute('data-marker'));
      expect(order).toEqual(['header', 'body', 'footer']);
    });

    it('deve renderizar children null/undefined normalmente', () => {
      const Wrapper = createMapWrapper({} as MapProps);

      const { queryByTestId } = render(
        <Wrapper>
          {null}
          {undefined}
        </Wrapper>,
      );

      expect(queryByTestId('card-header')).toBeNull();
      expect(queryByTestId('card-footer')).toBeNull();
    });

    it('deve renderizar children string normalmente', () => {
      const Wrapper = createMapWrapper({
        'Card.Header': { title: 'Test Title' },
      });

      const { container } = render(<Wrapper>Just a string</Wrapper>);

      expect(container).toHaveTextContent('Just a string');
      expect(container).not.toHaveTextContent('Test Title');
    });

    it('deve renderizar children númerico normalmente', () => {
      const Wrapper = createMapWrapper({
        'Card.Header': { title: 'Test Title' },
      });

      const { container } = render(<Wrapper>{42}</Wrapper>);
      expect(container).toHaveTextContent('42');
      expect(container).not.toHaveTextContent('Test Title');
    });

    it('deve lidar com arrays de children', () => {
      const Wrapper = createMapWrapper({
        'Card.Header': { title: 'Array Title' },
        'Card.Footer': { description: 'Array Desc' },
      });

      const { getByTestId } = render(
        <Wrapper>{[<Card.Header key="1" />, <Card.Footer key="2" />]}</Wrapper>,
      );

      expect(getByTestId('card-header')).toHaveTextContent('Array Title');
      expect(getByTestId('card-footer')).toHaveTextContent('Array Desc');
    });

    it('deve processar corretamente quando há mix de elementos válidos e inválidos', () => {
      const Wrapper = createMapWrapper({
        'Card.Header': { title: 'Mixed' },
        'Card.Footer': { description: 'Content' },
      });

      const { getByTestId } = render(
        <Wrapper>
          <Card.Header />
          <div data-testid="separator">Separator</div>
          <Card.Footer />
        </Wrapper>,
      );

      expect(getByTestId('card-header')).toHaveTextContent('Mixed');
      expect(getByTestId('card-footer')).toHaveTextContent('Content');

      const separator = getByTestId('separator');
      expectNativeElementNotInjected(separator, 'Separator');
    });

    it('props do filho devem sobrescrever props injetadas', () => {
      const Wrapper = createMapWrapper({
        'Card.Header': { title: 'Injected' },
      });

      const { getByTestId } = render(
        <Wrapper>
          <Card.Header title="Child Prop" />
        </Wrapper>,
      );

      expect(getByTestId('card-header')).toHaveTextContent('Child Prop');
    });

    it('deve mesclar props que não conflitam', () => {
      const Wrapper = createMapWrapper({
        'Card.Footer': { description: 'Injected Desc' },
      });

      const { getByTestId } = render(
        <Wrapper>
          <Card.Footer id="card-footer" />
        </Wrapper>,
      );

      const footer = getByTestId('card-footer');
      expect(footer).toHaveTextContent('Injected Desc');
      expect(footer).toHaveAttribute('id', 'card-footer');
    });
  });

  describe('Modo Broadcast (props)', () => {
    it('deve processar múltiplos componentes corretamente', () => {
      const Wrapper = createBroadcastWrapper({
        title: 'Main Title',
        description: 'Main Description',
      });

      const { getByTestId, container } = render(
        <Wrapper>
          <Card.Header />
          <Card.Body>Content here</Card.Body>
          <Card.Footer />
        </Wrapper>,
      );

      expect(getByTestId('card-header')).toHaveTextContent('Main Title');
      expect(getByTestId('card-footer')).toHaveTextContent('Main Description');
      expect(container).toHaveTextContent('Content here');
    });

    it('deve injetar props até mesmo em componentes sem displayName', () => {
      const Wrapper = createBroadcastWrapper({ title: 'Test Title' });

      const WithoutDisplayNameComponent = () => (
        <div data-testid="without-display-name">Without Display Name Component</div>
      );

      const { getByTestId } = render(
        <Wrapper>
          <WithoutDisplayNameComponent />
          <Card.Header />
        </Wrapper>,
      );

      const withoutDisplayNameComponent = getByTestId('without-display-name');

      expect(withoutDisplayNameComponent).not.toHaveAttribute('title');
      expect(withoutDisplayNameComponent).toHaveTextContent('Without Display Name Component');
      expect(getByTestId('card-header')).toHaveTextContent('Test Title');
    });

    it('não deve injetar props em elementos HTML nativos', () => {
      const Wrapper = createBroadcastWrapper({
        title: 'Test Title',
        description: 'Test Desc',
      });

      const { getByTestId } = render(
        <Wrapper>
          <div data-testid="native-div">Native Div</div>
          <Card.Header />
        </Wrapper>,
      );

      const nativeDiv = getByTestId('native-div');
      expectNativeElementNotInjected(nativeDiv, 'Native Div');
      expect(getByTestId('card-header')).toHaveTextContent('Test Title');
    });

    it('deve manter a ordem dos children após processamento', () => {
      const Wrapper = createBroadcastWrapper({
        title: 'Title',
        description: 'Desc',
      });

      const { container } = render(
        <Wrapper>
          <Card.Header data-order="1" />
          <Card.Body data-order="2">Middle</Card.Body>
          <Card.Footer data-order="3" />
        </Wrapper>,
      );

      const order = Array.from(container.querySelectorAll('[data-order]')).map((el) =>
        el.getAttribute('data-order'),
      );

      expect(order).toEqual(['1', '2', '3']);
    });

    it('deve renderizar children null/undefined normalmente', () => {
      const Wrapper = createBroadcastWrapper({
        title: 'Test',
        description: 'Test',
      });

      const { queryByTestId } = render(
        <Wrapper>
          {null}
          {undefined}
        </Wrapper>,
      );

      expect(queryByTestId('card-header')).toBeNull();
      expect(queryByTestId('card-footer')).toBeNull();
    });

    it('deve renderizar children string normalmente', () => {
      const Wrapper = createBroadcastWrapper({ title: 'Test Title' });

      const { container } = render(<Wrapper>Just a string</Wrapper>);

      expect(container).toHaveTextContent('Just a string');
      expect(container).not.toHaveTextContent('Test Title');
    });

    it('deve renderizar children númerico normalmente', () => {
      const Wrapper = createBroadcastWrapper({ title: 'Test Title' });

      const { container } = render(<Wrapper>{42}</Wrapper>);
      expect(container).toHaveTextContent('42');
      expect(container).not.toHaveTextContent('Test Title');
    });

    it('deve lidar com arrays de children', () => {
      const Wrapper = createBroadcastWrapper({
        title: 'Array Title',
        description: 'Array Desc',
      });

      const { getByTestId } = render(
        <Wrapper>{[<Card.Header key="1" />, <Card.Footer key="2" />]}</Wrapper>,
      );

      expect(getByTestId('card-header')).toHaveTextContent('Array Title');
      expect(getByTestId('card-footer')).toHaveTextContent('Array Desc');
    });

    it('deve processar corretamente quando há mix de elementos válidos e inválidos', () => {
      const Wrapper = createBroadcastWrapper({
        title: 'Mixed',
        description: 'Content',
      });

      const { getByTestId } = render(
        <Wrapper>
          <Card.Header />
          <div data-testid="native-element">Native Element</div>
          {null}
          <Card.Footer />
        </Wrapper>,
      );

      expect(getByTestId('card-header')).toHaveTextContent('Mixed');
      expect(getByTestId('card-footer')).toHaveTextContent('Content');

      const nativeElement = getByTestId('native-element');
      expectNativeElementNotInjected(nativeElement, 'Native Element');
    });

    it('props do filho devem sobrescrever props injetadas', () => {
      const Wrapper = createBroadcastWrapper({
        title: 'Injected',
        description: 'Injected Desc',
      });

      const { getByTestId } = render(
        <Wrapper>
          <Card.Header title="Child Prop" />
        </Wrapper>,
      );

      expect(getByTestId('card-header')).toHaveTextContent('Child Prop');
    });

    it('deve mesclar props que não conflitam', () => {
      const Wrapper = createBroadcastWrapper({
        title: 'Title',
        description: 'Injected Desc',
      });

      const { getByTestId } = render(
        <Wrapper>
          <Card.Footer data-extra="extra-prop" />
        </Wrapper>,
      );

      const footer = getByTestId('card-footer');
      expect(footer).toHaveTextContent('Injected Desc');
      expect(footer).toHaveAttribute('data-extra', 'extra-prop');
    });
  });
});
