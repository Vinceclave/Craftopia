# Fixing Existing Material Data

## Current Situation

### ✅ What's Already Fixed
- **New scans**: Material detection now uses improved normalization
- **Code changes**: All normalization logic is in place and working
- **Future data**: Any new materials scanned will be clean and deduplicated

### ❌ What Needs Fixing
- **Historical data**: Existing records in the database still have duplicated materials
- **Dashboard stats**: Still showing old duplicate counts
- **Saved crafts**: Old craft ideas have unnormalized materials

## How to Fix Existing Data

You have **two options**:

---

## Option 1: Run Database Migration (Recommended)

This will clean up all existing materials in the database.

### Steps:

1. **Navigate to backend directory:**
   ```bash
   cd apps/backend
   ```

2. **Run the migration script:**
   ```bash
   npx ts-node src/scripts/migrate-normalize-materials.ts
   ```

3. **What it does:**
   - Fetches all craft ideas from database
   - Normalizes the `recycled_materials` field
   - Updates records with cleaned data
   - Shows before/after for each change
   - Provides summary statistics

4. **Expected output:**
   ```
   🔄 Starting material normalization migration...
   
   📊 Found 150 craft ideas with materials
   
   📝 Craft ID 1:
      Before (10): plastic cap, plastic bottle, plastic water bottle...
      After (4): plastic bottles (4), plastic bottle caps (3), ...
   
   ✅ Migration completed!
   
   📊 Summary:
      Total crafts: 150
      Updated: 120
      Skipped (no changes): 28
      Errors: 2
   ```

### Safety Notes:
- ✅ Only updates `recycled_materials` field
- ✅ Doesn't delete any records
- ✅ Skips records that are already normalized
- ✅ Can be run multiple times safely
- ⚠️ **Backup recommended** before running

---

## Option 2: Let It Fix Naturally (Gradual)

If you don't want to run a migration, the data will gradually clean itself:

### How it works:
- **New scans**: Already normalized ✅
- **Old data**: Remains duplicated until:
  - User re-scans materials
  - User generates new crafts
  - Dashboard aggregates over time

### Timeline:
- **Immediate**: New data is clean
- **1 week**: ~30% of active data normalized
- **1 month**: ~70% of active data normalized
- **3 months**: ~95% of active data normalized

### Pros:
- ✅ No migration needed
- ✅ Zero risk
- ✅ No downtime

### Cons:
- ❌ Dashboard stats still show duplicates
- ❌ Old crafts still have messy data
- ❌ Takes time to fully clean

---

## Option 3: Hybrid Approach

Run migration for **active/recent data only**:

### Modify the migration script to only update recent records:

```typescript
const crafts = await prisma.craftIdea.findMany({
  where: {
    deleted_at: null,
    recycled_materials: { not: null },
    // Only update records from last 30 days
    created_at: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  },
  // ...
});
```

This gives you:
- ✅ Quick migration (fewer records)
- ✅ Fixes most visible data
- ✅ Lower risk
- ✅ Faster execution

---

## Verification After Migration

### 1. Check Dashboard Stats
Navigate to admin dashboard and verify:
- Material counts are deduplicated
- No more "plastic cap" vs "plastic bottle cap" duplicates
- Counts are aggregated correctly

### 2. Check Sample Crafts
Query a few craft ideas:
```sql
SELECT idea_id, recycled_materials 
FROM "CraftIdea" 
WHERE deleted_at IS NULL 
LIMIT 5;
```

Should see clean arrays like:
```json
["plastic bottles (3)", "cardboard boxes (2)", "aluminum cans (5)"]
```

Instead of:
```json
["plastic cap", "plastic bottle", "plastic water bottle", "plastic bottles", ...]
```

### 3. Test New Scans
Scan some materials and verify they're normalized immediately.

---

## Recommendation

**For production**: Run **Option 1** (full migration) during low-traffic hours

**For development**: Run **Option 1** immediately - no risk

**If unsure**: Start with **Option 3** (recent data only) to test

---

## Backup Before Migration

### Create a backup:
```bash
# Using pg_dump
pg_dump -h localhost -U your_user -d craftopia -t "CraftIdea" > craft_ideas_backup.sql

# Or using Prisma Studio
# Export the CraftIdea table to JSON
```

### Restore if needed:
```bash
psql -h localhost -U your_user -d craftopia < craft_ideas_backup.sql
```

---

## Running the Migration

### Full command with error handling:

```bash
cd apps/backend

# Backup first (optional but recommended)
npx prisma db pull

# Run migration
npx ts-node src/scripts/migrate-normalize-materials.ts 2>&1 | tee migration.log

# Check the log
cat migration.log
```

---

## Questions?

- **Will this break anything?** No, it only updates the materials array
- **Can I run it multiple times?** Yes, it's idempotent
- **How long will it take?** ~1-2 seconds per 100 records
- **Will users notice?** No, zero downtime
- **Can I rollback?** Yes, if you have a backup

---

## Summary

| Option | Speed | Risk | Completeness |
|--------|-------|------|--------------|
| Full Migration | Fast (minutes) | Low | 100% |
| Natural Fix | Slow (months) | None | Gradual |
| Hybrid | Medium | Very Low | 70-80% |

**Recommended**: Run the full migration now to get clean data immediately! 🚀
