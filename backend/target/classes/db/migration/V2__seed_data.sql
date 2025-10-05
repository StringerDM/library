INSERT INTO users (id, username, email, password_hash, role, created_at)
VALUES
    (gen_random_uuid(), 'librarian', 'admin@library.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5fJemG41Zsa1onbI5orxT4q7/Xr5OW.', 'ADMIN', NOW()),
    (gen_random_uuid(), 'reader', 'reader@library.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5fJemG41Zsa1onbI5orxT4q7/Xr5OW.', 'USER', NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO books (id, title, author, category, year, description, cover_url,
                   purchase_price, rent_two_weeks_price, rent_one_month_price, rent_three_months_price, status, created_at)
VALUES
    (gen_random_uuid(), 'Ночной поезд на Лиссабон', 'Паскаль Мерсье', 'Современная проза', 2004,
     'Философское путешествие учителя латинского языка, который однажды решается свернуть с привычного пути.',
     'https://covers.openlibrary.org/b/id/10509423-L.jpg', 18.90, 4.50, 6.90, 12.50, 'AVAILABLE', NOW()),
    (gen_random_uuid(), '451 градус по Фаренгейту', 'Рэй Брэдбери', 'Научная фантастика', 1953,
     'Антиутопия о мире, где книги объявлены вне закона, а пожарные жгут их вместе с домами.',
     'https://covers.openlibrary.org/b/id/9251996-L.jpg', 13.50, 3.20, 5.20, 9.30, 'AVAILABLE', NOW()),
    (gen_random_uuid(), 'Цветы для Элджернона', 'Дэниел Киз', 'Современная проза', 1966,
     'Дневник Чарли Гордона, мысленно взлетающего благодаря экспериментальной операции.',
     'https://covers.openlibrary.org/b/id/8165264-L.jpg', 11.80, 2.90, 4.40, 7.80, 'AVAILABLE', NOW()),
    (gen_random_uuid(), 'Пикник на обочине', 'Аркадий и Борис Стругацкие', 'Фантастика', 1972,
     'История сталкера Рэдрика Шухарта, добывающего артефакты в загадочной Зоне.',
     'https://covers.openlibrary.org/b/id/8311996-L.jpg', 9.90, 2.50, 3.70, 6.40, 'AVAILABLE', NOW()),
    (gen_random_uuid(), 'Имя розы', 'Умберто Эко', 'Детектив', 1980,
     'Средневековый детектив с расследованием серийных смертей в монастыре.',
     'https://covers.openlibrary.org/b/id/8231854-L.jpg', 16.40, 4.10, 6.20, 10.80, 'AVAILABLE', NOW()),
    (gen_random_uuid(), 'Семь смертей Эвелины Хардкасл', 'Стюарт Тёртон', 'Детектив', 2018,
     'Петля времени, загадочное убийство и семь шансов раскрыть преступление.',
     'https://covers.openlibrary.org/b/id/9874567-L.jpg', 17.20, 4.30, 6.70, 11.90, 'AVAILABLE', NOW()),
    (gen_random_uuid(), 'Семь навыков высокоэффективных людей', 'Стивен Кови', 'Нон-фикшн', 1989,
     'Практическое руководство по развитию личной эффективности и лидерства.',
     'https://covers.openlibrary.org/b/id/240726-L.jpg', 19.90, 4.80, 7.40, 12.90, 'AVAILABLE', NOW()),
    (gen_random_uuid(), 'Project Hail Mary', 'Andy Weir', 'Научная фантастика', 2021,
     'Инженер Райлэнд Грейс просыпается в космосе и пытается спасти человечество.',
     'https://covers.openlibrary.org/b/id/10717180-L.jpg', 21.50, 5.10, 7.90, 13.80, 'AVAILABLE', NOW())
ON CONFLICT (title, author) DO NOTHING;
