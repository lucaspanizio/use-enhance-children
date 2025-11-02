import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card } from './card';

describe('Card', () => {
  it('deve renderizar todos os subcomponentes corretamente', () => {
    const { getByTestId } = render(
      <Card title="Título" description="Descrição">
        <Card.Header />
        <Card.Body />
        <Card.Footer />
      </Card>,
    );

    expect(getByTestId('card')).toBeInTheDocument();
    expect(getByTestId('card-header')).toBeInTheDocument();
    expect(getByTestId('card-body')).toBeInTheDocument();
    expect(getByTestId('card-footer')).toBeInTheDocument();
  });

  it('deve propagar as props para os subcomponentes', () => {
    const { getByTestId } = render(
      <Card title="Título" description="Descrição">
        <Card.Header />
        <Card.Footer />
      </Card>,
    );

    expect(getByTestId('card-header')).toHaveTextContent('Título');
    expect(getByTestId('card-footer')).toHaveTextContent('Descrição');
  });
});
