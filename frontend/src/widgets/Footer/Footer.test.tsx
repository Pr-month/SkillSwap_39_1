import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from './Footer';

describe('Footer Component', () => {
  const renderFooter = () =>
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>,
    );

  it('renders without crashing', () => {
    renderFooter();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('contains copyright information', () => {
    renderFooter();
    // Обновляем селектор для текущего текста в футере
    expect(screen.getByText(/SkillSwap — 2026/i)).toBeInTheDocument();
  });

  it('contains social media links', () => {
    renderFooter();
    const socialLinks = screen.getAllByRole('link');
    expect(socialLinks.length).toBeGreaterThan(0);
  });

  it('contains navigation links', () => {
    renderFooter();
    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBeGreaterThan(0);
  });

  it('contains company info', () => {
    renderFooter();
    // Обновляем тексты для русского языка
    expect(screen.getByText(/О проекте/i)).toBeInTheDocument();
    expect(screen.getByText(/Контакты/i)).toBeInTheDocument();
  });
});
