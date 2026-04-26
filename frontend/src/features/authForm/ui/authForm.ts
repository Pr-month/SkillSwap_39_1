export type TPageTexts = {
  firstStage: {
    passwordPlaceholder: string;
    heading: string;
    text: string;
    buttonText: string;
  };

  registration: {
    passwordPlaceholder: string;
    heading: string;
    text: string;
    buttonText: string;
  };
};

export const PAGE_TEXTS: TPageTexts = {
  firstStage: {
    passwordPlaceholder: 'Введите ваш пароль',
    heading: 'С возвращением в SkillSwap!',
    text: 'Обменивайтесь знаниями и навыками с другими людьми',
    buttonText: 'Войти',
  },
  registration: {
    passwordPlaceholder: 'Придумайте надёжный пароль',
    heading: 'Добро пожаловать в SkillSwap!',
    text: 'Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми',
    buttonText: 'Далее',
  },
};
