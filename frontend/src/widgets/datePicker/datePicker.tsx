import { FC, useRef } from 'react';
import styles from './datePicker.module.css';
import { DayPicker, Matcher, OnSelectHandler } from 'react-day-picker';
import { ru } from 'react-day-picker/locale';
import 'dayjs/locale/ru';
import 'react-day-picker/style.css';
import Chevron from '@/app/assets/static/images/icons/chevron-down.svg';
import { Button } from '@/shared/ui/button/button';
import { useClickOutside } from '@/shared/hooks/useClickOutside';

type CustomDatePickerProps = {
  selected: Date | undefined;
  onSelect: OnSelectHandler<Date | undefined>;
  className?: string;
  endMonth?: Date;
  disabled?: Matcher;
  onCancelClick: () => void;
  onChooseClick: () => void;
  onClose: () => void; // Добавил для закрытия по клику снаружи
};

export const CustomDatePicker: FC<CustomDatePickerProps> = ({
  selected,
  onSelect,
  className,
  endMonth,
  disabled,
  onCancelClick,
  onChooseClick,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, onClose);

  return (
    <div ref={containerRef} className={`${styles.datePickerContainer} ${className}`}>
      <DayPicker
        mode="single"
        fixedWeeks={true}
        showOutsideDays
        captionLayout="dropdown"
        locale={ru}
        className={styles.datePicker}
        classNames={{
          months: styles.months,
          nav: styles.nav,
          dropdown_root: styles.dropdownRoot,
          month_caption: styles.monthCaption,
          weekday: styles.weekday,
          outside: styles.outside,
          dropdowns: styles.dropdowns,
          dropdown: styles.dropdown,
          day: styles.day,
          selected: styles.selected,
          month_grid: styles.monthGrid,
        }}
        components={{
          Chevron: () => <img src={Chevron} />,
        }}
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        endMonth={endMonth}
      />
      <Button children="Отменить" type="secondary" onClick={onCancelClick} />
      <Button children="Выбрать" onClick={onChooseClick} />
    </div>
  );
};
