# SkillSwap

SkillSwap — платформа обмена навыками в формате «Я научу / Хочу научиться».

Репозиторий собран как монорепа и содержит два приложения:
- `backend` — NestJS + TypeORM + PostgreSQL
- `frontend` — React + Vite + Redux Toolkit

## Что уже есть в проекте

- регистрация и логин пользователей
- CRUD для навыков, категорий, городов и заявок
- Swagger-документация для API
- сидинг стартовых данных
- unit- и e2e-тесты на backend

## Структура репозитория

```text
SkillSwap_39_1/
├── backend/   # API на NestJS
├── frontend/  # клиент на React + Vite
└── README.md
```

## Требования

Перед запуском убедись, что установлены:

- Node.js `22+`
- npm `10+`
- PostgreSQL `14+` или совместимая версия

## Быстрый старт

### 1. Установить зависимости

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Подготовить базу данных

По умолчанию backend подключается к Postgres со следующими значениями:

- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=password`
- `DB_DATABASE=skillswap`

Если базы `skillswap` ещё нет, создай её:

```bash
createdb -U postgres skillswap
```

Если у тебя другие настройки Postgres, создай локальный файл `backend/.env` на основе [backend/.env.example](backend/.env.example) и укажи свои значения.

### 3. Заполнить backend начальными данными

```bash
cd backend
npm run seed
```

Команда создаёт стартовые категории, города, тестовых пользователей, администратора и навыки, если это предусмотрено текущим набором сидов.

### 4. Запустить backend

```bash
cd backend
npm run start:dev
```

После запуска backend будет доступен по адресу:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

### 5. Запустить frontend

```bash
cd frontend
npm run dev
```

После запуска frontend будет доступен по адресу:

- UI: `http://localhost:8080`

## Переменные окружения

### Backend

Шаблон лежит в [backend/.env.example](backend/.env.example).

Основные переменные:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `JWT_SECRET`
- `JWT_SECRET_EXPIRES`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES`
- `MAX_FILE_SIZE`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_CITY`

Если `backend/.env` не создан, приложение использует значения по умолчанию из конфигов.

### Frontend

Шаблон лежит в [frontend/.env.example](frontend/.env.example).

Поддерживаемая переменная:

- `VITE_API_URL=http://localhost:3000`

Если переменная не задана, dev-сервер фронта проксирует запросы `/api/*` на `http://localhost:3000`.

## Полезные команды

### Backend

```bash
cd backend
npm run lint
npm run test
npm run test:e2e
npm run build
npm run seed
npm run seed:test
```

### Frontend

```bash
cd frontend
npm run lint
npm run test
npm run build
npm run storybook
```

## Текущее состояние интеграции

- backend поднимается локально и работает с PostgreSQL
- frontend поднимается локально через Vite
- часть клиентской логики уже ходит в backend через `/api` proxy
- часть клиентских сценариев пока всё ещё использует моки, поэтому не весь UI полностью завязан на живой backend

Это нормально для текущего состояния проекта: репозиторий уже можно локально запускать и развивать дальше, но интеграция фронта и бэка ещё не завершена во всех пользовательских сценариях.
