import React from 'react';
import { render, screen } from '@testing-library/react';
import { WorldMap } from '../index';

describe('WorldMap Component', () => {
  test('Render default 24hour clock', () => {
    render(<WorldMap />);
    const timeElement = screen.getByText(/\d{2}:\d{2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });
  test('Render default 12hour clock', () => {
    render(<WorldMap use24HourFormat={false} />);
    const timeElement = screen.getByText(/\d{2}:\d{2}:\d{2} (AM|PM)/);
    expect(timeElement).toBeInTheDocument();
  });
});
