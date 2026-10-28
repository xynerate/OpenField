# OpenFieldService

A scheduling and dispatch app for field service businesses — pest control, HVAC, plumbing, cleaning, landscaping, and more.

## Features
- Job scheduling with date/time, priority, and status workflow (pending → confirmed → in progress → completed)
- Weekly calendar view with technician color coding
- Customer management with contact info, addresses, and service history
- Technician dispatch and availability tracking
- Service type catalog with default pricing and durations
- Invoicing with draft/sent/paid/overdue tracking and line items
- Materials tracking per job with costs and inventory
- Job checklists for inspections and task lists
- Dashboard with KPIs (today's schedule, upcoming jobs, revenue, outstanding invoices)

## When to use this template
Use this template when the user wants to:
- Schedule and dispatch field technicians or service workers
- Manage a service business (pest control, HVAC, plumbing, cleaning, landscaping, electrical, pool service, etc.)
- Track jobs, customers, and invoices for a field service operation
- Build an alternative to PestPac, ServiceTitan, Jobber, Housecall Pro, or Fieldwork

## Record IDs and equipment

- Read `/api/openapi.json` for live request schemas. Record and relationship IDs are UUID strings; never parse them as numbers or invent sequential IDs.
- Keep readable job/invoice labels separate from record IDs.
- To service a known machine, open its `/assets/:id` page and choose **Schedule job**. The customer and equipment are selected; the API resolves a blank address from the current site.
- On `/schedule`, choose **Add job** under a day to prefill its date, or **New job** for today (Monday when viewing another week). Saving keeps the calendar open and follows the saved date if it moved to another week.
- An upgrade-required response means the database needs the explicit UUID migration. Back up and preserve existing records; never reset the database to fix this error.

## Customization guide

When customizing for a specific business vertical:

**Terminology** — adapt labels to the industry:
- "Technician" → "Stylist", "Cleaner", "Inspector", "Plumber", etc.
- "Job" → "Appointment", "Service Call", "Visit", "Work Order"
- "Service Type" → keep as-is or rename to "Treatment", "Service", "Package"

**Service types** — replace the default seed data in `schema.sql` with industry-specific services:
- Pest control: General Pest Treatment, Termite Inspection, Rodent Control, Mosquito Spray, Bed Bug Treatment
- HVAC: AC Repair, Furnace Installation, Duct Cleaning, Maintenance Plan, Emergency Service
- Plumbing: Drain Cleaning, Pipe Repair, Water Heater Install, Sewer Inspection, Leak Detection
- Cleaning: House Cleaning, Deep Clean, Move-in/Move-out, Carpet Cleaning, Window Washing

**Branding** — update the sidebar title, page headings, and any hardcoded company references to use the customer's company name.

**Dashboard** — adjust KPI labels if needed (e.g. "Treatments today" instead of "Jobs today").

**Priority levels** — the default priorities (low, normal, high, urgent) work for most verticals. Only change if the business uses different terminology.

## Current Project State & Handoff Context (South Africa / MTRSERVICES)

This project has been customized for a South African field service operation (**MTRSERVICES**):

1. **South African Localization**:
   - Currency is formatted in South African Rand (`R` / `ZAR`) across the dashboard, jobs, materials, service types, and invoices.
   - Customer forms use **Province** (defaulting to `Western Cape`) and **Postal Code** instead of US State/Zip.
   - Customer site creation defaults to the `Africa/Johannesburg` (`SAST`) timezone and provides a dropdown of South African/Southern African IANA timezones.

2. **Customer & Equipment Management**:
   - Full CRUD support (create, edit, archive, delete) for customer **Sites** and **Assets/Equipment** in `src/server/equipment.ts`, `src/client/components/customer-equipment.tsx`, and `src/client/components/equipment-forms.tsx`.
   - Customer details (`src/client/components/customer-detail.tsx`) can be edited inline.

3. **A4 Printable & Editable Invoice Template**:
   - Invoices (`src/client/components/invoice-detail.tsx` & `src/client/styles.css`) are styled as an **A4 portrait sheet** (`210mm × 297mm`) with `@media print` and `@page { size: A4 portrait; margin: 0; }` rules, plus a **Print A4** button.
   - `Sub Total`, `Total`, `Balance Due`, and `Bank Details` are wrapped in `.invoice-bottom-anchor` (`margin-top: auto`) so they remain anchored at the bottom of the A4 page right above the top edge of the footer rule, leaving open space above for multiple line items.
   - **Editable Invoice Format** (`src/client/components/edit-invoice-template.tsx` and `GET/PUT /api/invoice-template` in `src/server/index.ts`): Users can upload/change the company logo (stored as a Data URI or URL in `_meta.invoice_logo`), edit company name/address (`_meta.invoice_company_name`, `_meta.invoice_company_address`), payment terms (`_meta.invoice_terms`), and banking details (`_meta.invoice_bank_details`).

4. **Database Sync Across Machines (`seed.sql`)**:
   - Local D1 database state (including customers, jobs, invoices, and `_meta` settings like logo and banking details) is exported to `seed.sql` using idempotent `INSERT OR REPLACE INTO` statements.
   - Running `npm run dev` or `npm run db:setup` (`scripts/setup-db.mjs`) automatically seeds from `seed.sql` when the local database is empty.
   - Run `npm run db:export` before committing/pushing to save any new database/logo/banking changes into `seed.sql`.
   - Run `npm run db:seed` after pulling on another machine to apply updated `seed.sql` data into an existing local database.
