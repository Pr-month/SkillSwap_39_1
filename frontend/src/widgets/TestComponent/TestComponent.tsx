import React from 'react';

const TextTestComponent: React.FC = () => {
  const toggleTheme: React.MouseEventHandler<HTMLButtonElement> = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // Загружаем сохранённую тему при открытии страницы
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <>
      <h1>Hello world!</h1>
      <h2>Hello world!</h2>
      <h3>Hello world!</h3>
      <h4>Hello world!</h4>
      <p>
        Lorem ipsum dolor sit amet <a href="#">consectetur adipisicing elit</a>. Soluta architecto
        expedita, doloribus quia eligendi pariatur. Consectetur necessitatibus, ducimus perferendis
        praesentium aut magnam deleniti. Atque at quasi aut maxime vel corrupti.
      </p>
      <button onClick={toggleTheme}>Переключить тему</button>
    </>
  );
};

export default TextTestComponent;
