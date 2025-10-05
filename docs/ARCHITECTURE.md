# Архитектура проекта «Электронная библиотека»

Проект повторяет стек и подход из blog-app: Spring Boot 3 + PostgreSQL + Flyway + Vite/React/Tailwind + Zustand. Ниже описана предметная область и HTTP API.

## Модель предметной области

### Пользователь (`UserEntity`)
- `id` — UUID
- `username`, `email`, `passwordHash`
- `role` — `USER` или `ADMIN`
- временные метки `createdAt` / `updatedAt`

### Книга (`BookEntity`)
- `id` — UUID
- `title`, `author`, `category`, `year`
- `description`, `coverUrl`
- `pricing` (встроенный компонент `BookPricing`):
  - `purchasePrice`
  - `rentTwoWeeks`
  - `rentOneMonth`
  - `rentThreeMonths`
- `status` — `AVAILABLE`, `UNAVAILABLE`, `ARCHIVED`
- временные метки

### Операция (`OrderEntity`)
- `id` — UUID
- ссылка на `UserEntity` и `BookEntity`
- `type` — `PURCHASE`, `RENT_TWO_WEEKS`, `RENT_ONE_MONTH`, `RENT_THREE_MONTHS`
- `price`
- `startDate`, `endDate` (для покупок `endDate = null`)
- `status` — `ACTIVE`, `COMPLETED`, `OVERDUE`

### Напоминание (`ReminderEntity`)
- `id` — UUID
- ссылка на `OrderEntity`
- `remindAt`
- `delivered` (флаг для автоматизации)

## Потоки
- Пользователь просматривает каталог книг, фильтрует по категории/автору/году, открывает карточку книги, оформляет покупку или аренду.
- Администратор управляет каталогом (CRUD, изменение цен и статуса доступности), отслеживает аренды и отправляет напоминания об окончании аренды (готовим автоматически при помощи планировщика).

## REST API

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| `POST` | `/api/auth/register` | все | Регистрация с автоматическим входом |
| `POST` | `/api/auth/login` | все | Аутентификация, создаёт сессию |
| `POST` | `/api/auth/logout` | авторизованные | Завершение сессии |
| `GET` | `/api/auth/me` | авторизованные | Текущий пользователь |
| `GET` | `/api/books` | все | Каталог (query: `category`, `author`, `year`, `sort`) |
| `GET` | `/api/books/{id}` | все | Детали книги |
| `POST` | `/api/books` | `ADMIN` | Создание книги |
| `PUT` | `/api/books/{id}` | `ADMIN` | Обновление карточки и цен |
| `PATCH` | `/api/books/{id}/status` | `ADMIN` | Изменение статуса доступности |
| `GET` | `/api/orders/my` | `USER`/`ADMIN` | История покупок и аренд пользователя |
| `POST` | `/api/orders` | `USER`/`ADMIN` | Покупка или аренда книги |
| `GET` | `/api/admin/orders` | `ADMIN` | Все активные аренды |
| `GET` | `/api/admin/reminders` | `ADMIN` | Напоминания, подготовленные задачей |

## Автоматизация напоминаний
- Планировщик (`@Scheduled`) раз в час ищет активные аренды, у которых `endDate` в ближайшие 48 часов и напоминание ещё не отправлено.
- Создаёт записи `ReminderEntity` и помечает их `delivered = true`, имитируя отправку письма (в лог и через UI для администратора).

## Фронтенд
- React 18 + Vite + Tailwind; Zustand для состояния пользователя и каталога.
- Основные маршруты: `/login`, `/catalog`, `/orders`, `/admin/books`, `/admin/orders`, `/admin/reminders`.
- Для переиспользования стиля из blog-app переносим базовые компоненты (layout, карточки, таблицы) и палитру Tailwind.

