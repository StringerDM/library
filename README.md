# Электронная библиотека

Учебный проект на основе стека blog-app: Spring Boot 3 + PostgreSQL + Flyway и Vite/React/Tailwind + Zustand. Сервис предоставляет пользовательский и административный интерфейсы для работы с электронным каталогом книг.

## Возможности
- Каталог книг с фильтрами по категории, автору и году, сортировка по названию/автору/году.
- Просмотр карточки книги, описание, цены на покупку и аренду.
- Покупка и аренда книг на 2 недели, 1 или 3 месяца; личный раздел с историей операций.
- Администрирование каталога: добавление/редактирование книг, настройка цен, изменение статуса доступности.
- Мониторинг активных и просроченных аренд, автоматические напоминания пользователям за 24 часа до окончания аренды.

## Технологии
- **Backend:** Java 21, Spring Boot (Web, Data JPA, Security, Validation), Flyway, PostgreSQL.
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Zustand, React Router.
- **Аутентификация:** cookie-based session, роли `USER` и `ADMIN`.

## Запуск через Docker Compose

```bash
docker compose up --build
```

Сервисы:
- БД PostgreSQL: порт `5432` (пользователь/БД/пароль `library`).
- Backend: `http://localhost:8080`.
- Frontend (nginx): `http://localhost:3000`.

Команда остановки и очистки данных:
```bash
docker compose down -v
```

После первого старта доступны тестовые учётные записи:
- Администратор: `admin@library.local` / `password`
- Пользователь: `reader@library.local` / `password`

## Ручной запуск (без Docker)

### Подготовка БД
```bash
createdb library
createuser library --pwprompt
```

### Backend
```bash
cd backend
./mvnw.cmd spring-boot:run
```
Опциональные переменные окружения: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
При необходимости укажите `VITE_API_BASE_URL` в `.env`, если API доступен не по `http://localhost:8080`.

## Полезные команды
- `./mvnw.cmd -q -DskipTests package` — сборка backend.
- `npm run build` — production-сборка frontend.
- `docker compose logs -f backend` — просмотр логов backend в Docker.

## Структура
- `backend/` — Spring Boot приложение с миграциями Flyway.
- `frontend/` — Vite-проект с пользовательским и административным UI.
- `docs/ARCHITECTURE.md` — предметная область и описание API.
- `docker-compose.yml` — запуск всех компонентов одним командой.

## Дальнейшие шаги
- Подключить email/SMS-сервис вместо логов для реальных напоминаний.
- Добавить пагинацию и расширенный поиск в административном интерфейсе.
- Покрыть критичные сервисы автотестами (unit/integration).