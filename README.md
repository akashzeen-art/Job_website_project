# Meridian

A job portal for **international companies hiring in India**.

Meridian reads public career-page APIs (Greenhouse, Ashby, and Workday) from companies such as Stripe, Databricks, NVIDIA, OpenAI, MongoDB, Okta, and Salesforce, then keeps only roles tagged to India — Bengaluru, Hyderabad, Mumbai, Delhi NCR, Pune, Chennai, remote India, and more.

You apply on the employer’s own site. Meridian does not collect applications or resumes.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The first load talks to dozens of career boards and can take up to a minute. After that, listings are cached on disk for 30 minutes (`.cache/jobs.json`).

## What you can do

- Search live India roles by title, company, or city
- Filter the board by location, department, and employer
- Open a role and jump to the official apply page
- Save a shortlist in the browser

## Stack

Next.js, TypeScript, Tailwind CSS. No API keys required.
