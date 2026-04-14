# Git Commit Convention Reference

This package uses **Conventional Commits** to drive **automated semantic versioning**.

## Commit Format

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer(s)]
```

---

## Types and Their Effects

| Commit prefix | Release | Example |
|---|---|---|
| `feat:` | **minor** `1.0.0 → 1.1.0` | `feat: add ghost button variant` |
| `fix:` | **patch** `1.0.0 → 1.0.1` | `fix: resolve dark mode token leak` |
| `perf:` | **patch** | `perf: eliminate variant engine allocation` |
| `revert:` | **patch** | `revert: undo breaking layout change` |
| `docs:` | **patch** | `docs: update Next.js setup guide` |
| `refactor:` | **patch** | `refactor: extract token reader utility` |
| `build:` | **patch** | `build: upgrade tsup to 9.0` |
| `feat!:` | **major** `1.0.0 → 2.0.0` | `feat!: rename slots API to children` |
| `fix!:` | **major** | `fix!: remove deprecated variant prop` |
| `chore:` | no release | `chore: update lockfile` |
| `ci:` | no release | `ci: add bundle size check` |
| `test:` | no release | `test: add ResultCard slots coverage` |
| `style:` | no release | `style: fix lint warnings` |

> **Breaking change** = append `!` to any type, OR add `BREAKING CHANGE: ...` in the footer.

---

## Examples

### Feature (minor bump)
```
git commit -m "feat(ResultCard): add footer slot support"
```

### Bug Fix (patch bump)
```
git commit -m "fix(ThemeContext): prevent token desync on rapid toggle"
```

### Breaking Change (major bump)
```
git commit -m "feat!: replace children API with mandatory slot props"

# Or via footer:
git commit -m "feat(ResultCard): enforce structural slots

BREAKING CHANGE: The children prop has been removed.
Use the slots prop instead: <ResultCard slots={{ title, status, reason }} />"
```

### No Release
```
git commit -m "chore: bump dev dependencies"
git commit -m "ci: add commitlint to PR workflow"
```

---

## Canary Releases (next branch)

Push to `next` branch to publish a pre-release:

```bash
git checkout -b next
git commit -m "feat: experimental polymorphic table component"
git push origin next
```

This publishes `@pda-sim/ui-framework@1.1.0-next.1` to npm.

Install it with:
```bash
npm install @pda-sim/ui-framework@next
```

When ready for stable release, merge `next` → `main`:
```bash
git checkout main
git merge next
git push origin main
# → publishes @pda-sim/ui-framework@1.1.0 (stable)
```
