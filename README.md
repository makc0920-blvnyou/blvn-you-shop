# blvn.you — Интернет-магазин брелоков-котиков 🐱

Уникальные брелоки-котики ручной работы в кимоно. Дофаминовые мелочи для души.

## 🚀 Быстрый старт

```bash
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

## 🔧 Настройка

### 1. Supabase (База данных)

1. Зарегистрируйтесь на [supabase.com](https://supabase.com), создайте проект
2. В **SQL Editor** выполните SQL для создания таблиц:

```sql
-- Таблица заказов
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_service TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_details JSONB,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'new',
  telegram_sent BOOLEAN DEFAULT FALSE
);

-- Таблица товаров
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'kimonos',
  in_stock BOOLEAN DEFAULT TRUE
);
```

3. **Отключите RLS** для таблиц orders и products (или создайте политики на вставку/чтение):
   - В боковом меню: **Authentication → Policies**
   - Для каждой таблицы включите "Enable RLS" и добавьте политику "Allow all" (или выключите RLS через SQL: `ALTER TABLE orders DISABLE ROW LEVEL SECURITY;`)

4. **Создайте бакет для изображений** в Supabase Storage:
   - В боковом меню: **Storage → New bucket**
   - Название: `products`
   - Публичный бакет: **включите** "Public bucket"
   - В **Policies** добавьте политику: `(true)` для SELECT, INSERT, UPDATE, DELETE

5. В **Settings → API** скопируйте `Project URL` и `Anon public key`

### 2. DeepSeek API (AI агенты)

1. Зарегистрируйтесь на [platform.deepseek.com](https://platform.deepseek.com)
2. API Keys → Create new key, скопируйте ключ

### 3. Telegram бот (Уведомления о заказах)

1. В Telegram найдите **@BotFather**, отправьте `/newbot`
2. Скопируйте токен
3. Найдите **@userinfobot**, нажмите Start — получите `chat_id`

### 4. Переменные окружения

Создайте `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DEEPSEEK_API_KEY=your_deepseek_api_key
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
ADMIN_SECRET_KEY=my_super_secret_password_123
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Важно**: `ADMIN_SECRET_KEY` — пароль для входа в админ-панель. Задайте свой.

## 🔐 Админ-панель

Управление товарами осуществляется через защищенный раздел:

1. Откройте `/admin/login`
2. Введите пароль из `ADMIN_SECRET_KEY`
3. В админ-панели можно:
   - **Добавлять** товары (название, описание, цена, категория, загрузка фото)
   - **Редактировать** существующие товары
   - **Удалять** товары
   - Изображения загружаются в Supabase Storage (бакет `products`)

Все товары хранятся в таблице `products` в Supabase. Каталог на сайте читает данные оттуда.

## 📁 Структура проекта

```
blvn-you-shop/
├── app/
│   ├── api/
│   │   ├── products/        # CRUD товаров
│   │   ├── upload/          # Загрузка изображений
│   │   ├── orders/          # Заказы
│   │   ├── telegram/        # Telegram уведомления
│   │   ├── chat/            # AI чат
│   │   └── admin/           # Аутентификация админа
│   ├── admin/login/         # Вход в админку
│   ├── admin/products/      # Управление товарами
│   ├── catalog/             # Каталог товаров
│   ├── cart/                # Корзина
│   ├── checkout/            # Оформление заказа
│   ├── thanks/              # Страница благодарности
│   ├── privacy/             # Политика конфиденциальности
│   ├── offer/               # Публичная оферта
│   └── returns/             # Возврат и обмен
├── components/
│   ├── ui/                  # Button, Input, Select
│   ├── Header.tsx
│   ├── Footer.tsx (с реквизитами ИП)
│   ├── ProductCard.tsx
│   ├── AIChatWidget.tsx
│   └── CookieBanner.tsx
├── lib/
│   ├── supabase/            # Клиент Supabase
│   ├── deepseek.ts
│   └── utils.ts
└── context/CartContext.tsx
```

## 📝 Юридические страницы

- `/privacy` — Политика обработки персональных данных (Закон РБ № 99-З)
- `/offer` — Публичная оферта
- `/returns` — Правила возврата и обмена

> **Важно**: Замените реквизиты ИП в `components/Footer.tsx` на свои реальные данные!

## 🎨 Дизайн-система

- **Primary**: #9B7ED9, **Accent**: #FFB6C1, **Background**: #FAF7FF
- **Шрифт**: Nunito, **Border radius**: 16px (карточки), 24px (кнопки)

## ✅ Функционал

- Главная с hero и популярными товарами
- Каталог с фильтрацией по категориям
- Корзина с изменением количества
- Оформление заказа (3 вида доставки: Европочта, СДЭК, Белпочта)
- Сохранение заказов в Supabase + Telegram уведомления
- AI чат-консультант (DeepSeek)
- Админ-панель с CRUD товаров и загрузкой изображений
- Cookie-баннер
- Юридические страницы для ИП (РБ)
- Согласие на обработку персональных данных в чекауте
- Адаптивный дизайн, анимации Framer Motion

## 📱 Команды

```bash
npm run dev      # Разработка
npm run build    # Сборка
npm run start    # Продакшн
npm run lint     # Проверка кода
```
