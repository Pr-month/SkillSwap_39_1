import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, vi, beforeEach, afterEach, Mock } from 'vitest';
import { AuthWizard } from './authWizard';
import { useSelector } from '@/services/store/store';

vi.mock('@/shared/ui/stepIndicator/stepIndicator', () => ({
  StepIndicator: ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
    <div data-testid="step-indicator">
      Шаг: {currentStep}/{totalSteps}
    </div>
  ),
}));

vi.mock('@/services/store/store', () => ({
  useSelector: vi.fn(),
}));

const mockUseSelector = useSelector as Mock;

describe('AuthWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('отображает "No steps!" при отсутствии children', () => {
    mockUseSelector.mockReturnValue(0);
    mockUseSelector.mockReturnValueOnce(0);

    render(<AuthWizard children={[]} />);
    expect(screen.getByText('No steps!')).toBeInTheDocument();
  });

  test('корректно рендерит первый шаг и информацию о прогрессе', () => {
    const children = [<div key="1">Шаг 1 Content</div>, <div key="2">Шаг 2 Content</div>];

    mockUseSelector.mockReturnValueOnce(0).mockReturnValueOnce(2);

    render(<AuthWizard children={children} />);

    expect(screen.getByText('Шаг 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Шаг 2 Content')).not.toBeInTheDocument();

    expect(screen.getByText('Шаг 1 из 2')).toBeInTheDocument();

    const indicator = screen.getByTestId('step-indicator');
    expect(indicator).toHaveTextContent('Шаг: 0/2');
  });

  test('корректно изменяет шаги при обновлении currentStep', async () => {
    const children = [<div key="1">Шаг 1 Content</div>, <div key="2">Шаг 2 Content</div>];

    const { rerender } = render(<AuthWizard children={children} />);

    mockUseSelector.mockReturnValueOnce(1).mockReturnValueOnce(2);

    rerender(<AuthWizard children={children} />);

    await waitFor(() => {
      expect(screen.getByText('Шаг 2 Content')).toBeInTheDocument();
      expect(screen.queryByText('Шаг 1 Content')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Шаг 2 из 2')).toBeInTheDocument();
    const indicator = screen.getByTestId('step-indicator');
    expect(indicator).toHaveTextContent('Шаг: 1/2');
  });

  test('корректно отображает текст и прогресс при разных шагах', () => {
    const children = [<div key="1">Шаг 1</div>, <div key="2">Шаг 2</div>, <div key="3">Шаг 3</div>];

    mockUseSelector.mockReturnValueOnce(2).mockReturnValueOnce(3);

    render(<AuthWizard children={children} />);

    expect(screen.getByText('Шаг 3 из 3')).toBeInTheDocument();
    const indicator = screen.getByTestId('step-indicator');
    expect(indicator).toHaveTextContent('Шаг: 2/3');
  });

  test('отображает "No steps!" при пустом массиве children', () => {
    mockUseSelector.mockReturnValue(0);
    mockUseSelector.mockReturnValueOnce(0);

    render(<AuthWizard children={[]} />);
    expect(screen.getByText('No steps!')).toBeInTheDocument();
    expect(screen.queryByTestId('step-indicator')).not.toBeInTheDocument();
  });
});
