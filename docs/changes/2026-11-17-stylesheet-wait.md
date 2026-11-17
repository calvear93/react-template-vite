---
status: done # planned | in-progress | done | dropped
---

# A stylesheet that never answers does not hold the kit's on-demand parts

## Goal

Before a part loaded on demand, the kit asks again for the stylesheets that did not arrive, and
waits for them. That wait is shared by every part: a stylesheet whose request hung held them all
for good, with no retry.

## Plan

- [x] A spec of a stylesheet asked for again that never answers
- [x] The reload waits up to a limit; the part loads without the stylesheet after it

## Decisions

- Up to 10 s (`STYLESHEET_WAIT` in `internal/on-demand.ts`) · a stylesheet that takes longer does
  not save the part from showing unstyled, and holding the code would leave a confirmation with
  no dialog · no wait at all (the code would come back unstyled after every offline spell).

## Verification

- Gate: `pnpm lint` and `pnpm stylelint` clean, `tsc --noEmit` clean, `pnpm build:dev` built,
  `pnpm test:dev --coverage --run` → 135 files, 1,891 tests passed; coverage 99.76 % / 97.98 % /
  100 % / 99.93 %.
- The new spec timed out before the limit and held the next spec too; with it, both parts load
  at 10 s and not before.

## Not included / assumptions

- A retry of the stylesheet after the limit: the next load asks for it again, as before.
