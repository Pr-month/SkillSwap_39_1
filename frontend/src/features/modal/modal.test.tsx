import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { Modal } from './modal';
import { ModalUI } from '@/shared/ui/modal/modalUi';
import { ModalOverlayUI } from '@/shared/ui/modal-overlay/modal-overlay';

// Мокаем createPortal
vi.mock('react-dom', () => ({
  createPortal: (children: React.ReactNode) => children,
}));

describe('Компонент Modal и его подкомпоненты', () => {
  describe('Компонент Modal', () => {
    beforeEach(() => {
      // Создаем элемент для портала
      const modalRoot = document.createElement('div');
      modalRoot.setAttribute('id', 'modals');
      document.body.appendChild(modalRoot);
    });

    afterEach(() => {
      // Очищаем после каждого теста
      const modalRoot = document.getElementById('modals');
      if (modalRoot) {
        document.body.removeChild(modalRoot);
      }
    });

    it('вызывает onClose при нажатии Escape', () => {
      const onCloseMock = vi.fn();
      render(<Modal onClose={onCloseMock} title="Тест" type="info" />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('удаляет обработчик события при размонтировании', () => {
      const removeListenerSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = render(<Modal onClose={vi.fn()} title="Тест" type="info" />);

      unmount();
      expect(removeListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Компонент ModalUI', () => {
    it('отображает модалку типа info с заголовком и описанием', () => {
      render(
        <ModalUI type="info" title="Информация" description="Описание" onClose={vi.fn()}>
          <div>Дополнительный контент</div>
        </ModalUI>,
      );

      expect(screen.getByRole('heading', { name: 'Информация' })).toBeInTheDocument();
      expect(screen.getByText('Описание')).toBeInTheDocument();
      expect(screen.getByText('Дополнительный контент')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('отображает модалку типа confirmation с кнопками', () => {
      const primaryAction = vi.fn();
      const secondaryAction = vi.fn();

      render(
        <ModalUI
          type="confirmation"
          title="Подтверждение"
          description="Вы уверены?"
          image="/test.png"
          onClose={vi.fn()}
          primaryButtonText="Да"
          primaryButtonAction={primaryAction}
          secondaryButtonText="Нет"
          secondaryButtonAction={secondaryAction}
        />,
      );

      expect(screen.getByRole('heading', { name: 'Подтверждение' })).toBeInTheDocument();
      expect(screen.getByText('Вы уверены?')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Да'));
      expect(primaryAction).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('Нет'));
      expect(secondaryAction).toHaveBeenCalledTimes(1);
    });

    it('использует onClose как действие по умолчанию для основной кнопки', () => {
      const onCloseMock = vi.fn();
      render(
        <ModalUI type="confirmation" title="Тест" onClose={onCloseMock} primaryButtonText="OK" />,
      );

      fireEvent.click(screen.getByText('OK'));
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('применяет переданный className к модальному окну', () => {
      const { container } = render(
        <ModalUI title="Тест" onClose={vi.fn()} className="custom-class" type="info" />,
      );

      const modal = container.querySelector('.custom-class');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Компонент ModalOverlayUI', () => {
    it('вызывает onClick при клике', () => {
      const onClickMock = vi.fn();
      render(<ModalOverlayUI onClick={onClickMock} />);

      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });
});
