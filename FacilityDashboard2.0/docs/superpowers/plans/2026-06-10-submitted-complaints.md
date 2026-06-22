# Submitted Complaints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated submitted complaints table and complaint detail page under More.

**Architecture:** Static HTML pages share localStorage complaint data. The form writes a record, the list reads and renders rows, and the detail page reads one record by query string.

**Tech Stack:** HTML, CSS, vanilla JavaScript, existing `MainStyle.css`, existing Bootstrap bundle.

---

### Task 1: Update Complaint Form

**Files:**
- Modify: `more/complaints-suggestions.html`

- [ ] Add More sidebar link for `submitted-complaints.html`.
- [ ] Add a submitted complaints action in the page header.
- [ ] Replace demo submit alert with localStorage save and redirect to `submitted-complaints.html`.

### Task 2: Add Submitted Complaints Table

**Files:**
- Create: `more/submitted-complaints.html`

- [ ] Create a More page with search, summary cards, and a responsive table.
- [ ] Seed demo complaints when `localStorage` has no complaint records.
- [ ] Make each row and View button open `complaint-details.html?id=<complaint-id>`.

### Task 3: Add Complaint Details Page

**Files:**
- Create: `more/complaint-details.html`

- [ ] Read `id` from URL.
- [ ] Render complaint fields, attachments, and timeline.
- [ ] Show an empty state when no matching complaint exists.

### Task 4: Verify

**Files:**
- Test manually in browser or by static inspection.

- [ ] Submit a valid complaint.
- [ ] Confirm redirect to submitted complaints table.
- [ ] Confirm detail page opens from row and View button.
- [ ] Confirm unknown IDs show empty state.
