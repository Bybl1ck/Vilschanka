# Вільшанка — сайт заміського комплексу

Презентаційний MVP на Next.js 16, TypeScript і Tailwind CSS. Публічна частина показує будиночки, ресторан, активності, контакти та зайняті дати. Бронювання й оплати на сайті немає — гості телефонують адміністратору.

## Локальний запуск

Потрібен Node.js 20.9 або новіший.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Після запуску відкрийте [http://localhost:3000](http://localhost:3000). Службовий вхід розташований за адресою [http://localhost:3000/vilshanka-control](http://localhost:3000/vilshanka-control).

Якщо файл `.env.local` не створений, локальний демо-пароль: `vilshanka-admin`. Перед публікацією обов’язково задайте власні `ADMIN_PASSWORD` і `ADMIN_SECRET`.

## Де змінювати дані

- Будиночки, ціни, зручності, фото-шляхи та зайняті дати: через `/vilshanka-control`; зміни зберігаються в таблиці Supabase `houses`.
- `data/houses.json` використовується для першого seed і як резервне публічне відображення, якщо Supabase тимчасово недоступний або таблиця ще не створена.
- Заявки на зворотний дзвінок: у розділі «Заявки» за адресою `/vilshanka-control`; дані зберігаються в таблиці Supabase `callback_requests`.

## Захист адмін-панелі

Адмін-панель використовує підписану HTTP-only cookie-сесію строком на 7 днів. У production обов’язково додайте у Vercel:

```env
ADMIN_PASSWORD=надійний-пароль
ADMIN_SECRET=довгий-випадковий-секрет
SUPABASE_SERVICE_ROLE_KEY=серверний-service-role-key
```

`ADMIN_SECRET` і `SUPABASE_SERVICE_ROLE_KEY` використовуються лише на сервері та не повинні мати префікс `NEXT_PUBLIC_`. Без `ADMIN_PASSWORD` і `ADMIN_SECRET` production-вхід заблокований; без service role key адмінські операції Supabase заблоковані. Після зміни env виконайте новий deploy, потім застосуйте `supabase/houses.sql` і `supabase/admin-security.sql` у Supabase SQL Editor.
- Адреса, Google Maps, телефони, Instagram, Facebook і посилання на меню: `lib/constants.ts`.
- Брендовий логотип: `public/images/logo-vilshanka.png`. Якщо файл ще не доданий, шапка й адмін-вхід автоматично показують текстову версію без помилки layout.
- Скрін карти: `public/images/location-map.png`. Якщо файл відсутній, контакти автоматично показують синій fallback-блок з адресою та кнопкою маршруту.
- Локальні фото-заглушки: `public/images`. Реальні фото можна покласти сюди й указати шлях `/images/назва-файлу.jpg` в адмінці. Також підтримуються HTTPS-посилання на зображення.
- Завантажені через адмін-панель фото зберігаються в public bucket Supabase Storage `house-images`, а public URL автоматично підставляються у форму будиночка.
- Основні кольори та шрифти: `tailwind.config.ts`; глобальні стилі: `app/globals.css`.

## Збереження даних

Будиночки зберігаються в таблиці Supabase `houses`. Серверний репозиторій `lib/houses.ts` перетворює snake_case поля бази на camelCase тип `House`, тому публічні компоненти й адмінка не залежать від структури таблиці.

Перед першим запуском:

1. Виконайте `supabase/houses.sql` у Supabase SQL Editor.
2. Переконайтеся, що в `.env.local` задані `NEXT_PUBLIC_SUPABASE_URL` і `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` або `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Перенесіть поточні дані командою:

```bash
npm run seed:houses
```

Seed використовує `upsert` за `id`, тому його можна запускати повторно без дублювання будиночків. Для посиленого production-захисту серверних записів можна додати `SUPABASE_SERVICE_ROLE_KEY` у Vercel; ця змінна ніколи не повинна мати префікс `NEXT_PUBLIC_`.

Перед першим завантаженням фото виконайте `supabase/storage.sql` у Supabase SQL Editor і додайте `SUPABASE_SERVICE_ROLE_KEY` локально та у Vercel. Bucket `house-images` має бути public. Старі локальні шляхи `/images/...` продовжують працювати.

## Перевірка production-збірки

```bash
npm run build
npm start
```
