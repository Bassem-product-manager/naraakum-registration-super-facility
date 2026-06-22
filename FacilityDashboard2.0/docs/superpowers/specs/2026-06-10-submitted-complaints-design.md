# Submitted Complaints Design

## Goal
Move submitted complaints out from below the complaint form into a separate More page, with a clean table and a detail page per complaint.

## Pages
- `more/complaints-suggestions.html`: complaint submission only, plus a link to submitted complaints.
- `more/submitted-complaints.html`: table of submitted complaints with search, status summary, and View action.
- `more/complaint-details.html`: detail view for one complaint selected by `id`.

## Data Flow
The static demo app stores complaints in `localStorage` under `naraakumComplaints`. New form submissions create a complaint record, save it, and redirect to the submitted complaints page. If storage is empty, seeded demo complaints appear.

## UI
The table uses compact dashboard styling, status pills, priority chips, and row click behavior. The detail page shows summary fields, full details, attachments, and a timeline.

## Error Handling
If a detail `id` is missing or unknown, the page shows a clear empty state with a Back to list action.

## Verification
Open the form, submit a valid complaint, confirm it appears in the table, then open the detail page from the table row.
