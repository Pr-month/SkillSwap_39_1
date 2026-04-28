import { useRef } from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { useClickOutside } from '../useClickOutside';

describe('useClickOutside', () => {
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();
  });

  function TestComponent() {
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, callback);
    return (
      <div ref={ref} data-testid="target">
        Контент
      </div>
    );
  }

  test('вызывает callback при клике вне элемента', () => {
    render(<TestComponent />);

    const event = new MouseEvent('mousedown', {
      bubbles: true,
    });
    document.body.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('не вызывает callback при клике внутри элемента', () => {
    const { getByTestId } = render(<TestComponent />);

    const target = getByTestId('target');
    const event = new MouseEvent('mousedown', {
      bubbles: true,
    });
    target.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });
});
