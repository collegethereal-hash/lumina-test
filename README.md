This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Временное отключение Пиратской Эры (Era 2)

На данный момент код второй (Пиратской) эры отключен для обеспечения стабильной сборки и работы первой эры (Palia) в продакшене.
Чтобы вернуть Пиратскую эру:
1. В `tsconfig.json` уберите `"src/eras/pirate/**/*"` из массива `exclude`.
2. Выполните глобальный поиск по проекту по фразе `TEMPORARILY DISABLED`.
3. Раскомментируйте все импорты и рендеры компонентов, связанных с `pirate` (в `src/app/**/page.tsx` и `src/components/EraContent.tsx`).
4. В файле `src/context/EraContext.tsx` уберите принудительную установку эпохи `palia` и снимите блокировку в функции `setEra`.
