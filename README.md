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

The first load talks to dozens of career boards and can take a little while. After that, listings are cached in the browser (`sessionStorage`) for 30 minutes.

## What you can do

- Search live India roles by title, company, or city
- Filter the board by location, department, and employer
- Open a role and jump to the official apply page
- Save a shortlist in the browser

## Stack

React, Vite, TypeScript, Tailwind CSS, React Router. No API keys required.

Dev and preview proxy Greenhouse and Ashby through `/ats/gh` and `/ats/ashby`. Workday posts go through `/ats/wd` on the Vite server. On Vercel, Greenhouse and Ashby are rewritten in `vercel.json`; Workday listings may be empty there unless you add a similar server-side proxy.
