## Change

Update the portfolio/LinkedIn input label in the apply form from:

> Portfolio, LinkedIn, or any professional link (optional)

to:

> Portfolio or LinkedIn (Optional)

## File to edit

- `src/routes/apply.tsx` — line containing the `FloatingField` label for the portfolio/LinkedIn input.

## Scope

Only the visible label text changes. No logic, validation, or other UI changes.

## Verification

- Open `/apply`.
- Confirm the input label now reads "Portfolio or LinkedIn (Optional)".
- Confirm the field still accepts and submits the same data.