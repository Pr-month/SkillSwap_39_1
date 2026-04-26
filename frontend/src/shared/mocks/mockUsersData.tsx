export const generateProfiles = (count: number) => {
  const genders = ['male', 'female', 'any'] as const;

  return Array.from({ length: count }, (_, i) => ({
    _id: `user_${i + 1}`,
    name: `Пользователь ${i + 1}`,
    image: '',
    city: ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург'][i % 4],

    gender: genders[i % genders.length],
    birthdayDate: new Date(1980 + (i % 20), 1, 1).toISOString(),
    description: `Опытный специалист с ${5 + (i % 10)} годами опыта`,
    likes: [],
    createdAt: new Date(2023, 0, i + 1).toISOString(),
    canTeach: {
      category: 'Бизнес и карьера',
      subcategory: 'Управление проектами',
      subcategoryId: `teach_${i + 1}`,
      name: `Навык ${i + 1}`,
      description: 'Может научить управлению проектами',
      image: [''],
      customSkillId: `skill_${i + 1}`,
    },
    wantsToLearn: [
      {
        category: 'Иностранные языки',
        subcategory: 'Английский',
        subcategoryId: `learn_${i + 1}`,
        name: `Хочу изучить английский`,
        customSkillId: `want_${i + 1}`,
      },
    ],
  }));
};
