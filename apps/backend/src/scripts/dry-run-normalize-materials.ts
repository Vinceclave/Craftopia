// Dry-run migration script - shows what WOULD change without modifying database
// Run with: npx ts-node src/scripts/dry-run-normalize-materials.ts

import prisma from '../config/prisma';
import { testNormalization } from '../ai/services/material.service';

interface CraftWithMaterials {
    idea_id: number;
    recycled_materials: any;
    created_at: Date;
}

async function dryRunMigration() {
    console.log('🔍 DRY RUN - Material Normalization Preview\n');
    console.log('⚠️  This will NOT modify any data - just showing what would change\n');
    console.log('='.repeat(70));

    try {
        // Fetch all craft ideas with materials
        const crafts = await prisma.craftIdea.findMany({
            where: {
                deleted_at: null
            },
            select: {
                idea_id: true,
                recycled_materials: true,
                created_at: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        console.log(`\n📊 Found ${crafts.length} craft ideas with materials\n`);

        let wouldUpdateCount = 0;
        let alreadyCleanCount = 0;
        let skippedCount = 0;
        let totalDuplicatesRemoved = 0;

        const changes: Array<{
            id: number;
            before: string[];
            after: string[];
            beforeCount: number;
            afterCount: number;
            created: Date;
        }> = [];

        for (const craft of crafts) {
            try {
                // Skip if no materials
                if (!craft.recycled_materials) {
                    skippedCount++;
                    continue;
                }

                // Extract materials array
                let materials: string[] = [];

                if (Array.isArray(craft.recycled_materials)) {
                    materials = craft.recycled_materials.filter((m): m is string => typeof m === 'string');
                } else if (typeof craft.recycled_materials === 'object' && craft.recycled_materials !== null) {
                    const materialsObj = craft.recycled_materials as any;
                    if (Array.isArray(materialsObj.materials)) {
                        materials = materialsObj.materials;
                    }
                }

                if (materials.length === 0) {
                    skippedCount++;
                    continue;
                }

                // Normalize materials
                const normalizedMaterials = testNormalization(materials);

                // Check if normalization made any changes
                const hasChanges = JSON.stringify(materials.sort()) !== JSON.stringify(normalizedMaterials.sort());

                if (hasChanges) {
                    wouldUpdateCount++;
                    const duplicatesRemoved = materials.length - normalizedMaterials.length;
                    totalDuplicatesRemoved += duplicatesRemoved;

                    changes.push({
                        id: craft.idea_id,
                        before: materials,
                        after: normalizedMaterials,
                        beforeCount: materials.length,
                        afterCount: normalizedMaterials.length,
                        created: craft.created_at
                    });
                } else {
                    alreadyCleanCount++;
                }

            } catch (error: any) {
                console.error(`❌ Error analyzing craft ${craft.idea_id}:`, error.message);
                skippedCount++;
            }
        }

        // Show detailed changes for first 10 records
        console.log('\n📝 SAMPLE CHANGES (First 10 records that would be updated):\n');
        console.log('='.repeat(70));

        const samplesToShow = Math.min(10, changes.length);
        for (let i = 0; i < samplesToShow; i++) {
            const change = changes[i];
            console.log(`\n🔹 Craft ID: ${change.id} (Created: ${change.created.toLocaleDateString()})`);
            console.log(`   📥 BEFORE (${change.beforeCount} items):`);
            change.before.forEach((m, idx) => {
                console.log(`      ${idx + 1}. ${m}`);
            });
            console.log(`   📤 AFTER (${change.afterCount} items):`);
            change.after.forEach((m, idx) => {
                console.log(`      ${idx + 1}. ${m}`);
            });
            console.log(`   ✂️  Duplicates removed: ${change.beforeCount - change.afterCount}`);
        }

        if (changes.length > 10) {
            console.log(`\n   ... and ${changes.length - 10} more records would be updated`);
        }

        // Summary statistics
        console.log('\n' + '='.repeat(70));
        console.log('\n📊 MIGRATION IMPACT SUMMARY:\n');
        console.log(`   Total craft ideas analyzed: ${crafts.length}`);
        console.log(`   Would be updated: ${wouldUpdateCount} (${((wouldUpdateCount / crafts.length) * 100).toFixed(1)}%)`);
        console.log(`   Already clean (no changes): ${alreadyCleanCount} (${((alreadyCleanCount / crafts.length) * 100).toFixed(1)}%)`);
        console.log(`   Skipped (errors/empty): ${skippedCount}`);
        console.log(`   Total duplicate entries removed: ${totalDuplicatesRemoved}`);

        if (wouldUpdateCount > 0) {
            const avgDuplicatesPerRecord = (totalDuplicatesRemoved / wouldUpdateCount).toFixed(1);
            console.log(`   Average duplicates per record: ${avgDuplicatesPerRecord}`);
        }

        // Show most common duplicates
        console.log('\n📈 MOST COMMON DUPLICATE PATTERNS:\n');
        const duplicatePatterns: Record<string, number> = {};

        for (const change of changes) {
            for (const material of change.before) {
                const normalized = testNormalization([material])[0];
                if (material.toLowerCase() !== normalized.toLowerCase()) {
                    const pattern = `"${material}" → "${normalized}"`;
                    duplicatePatterns[pattern] = (duplicatePatterns[pattern] || 0) + 1;
                }
            }
        }

        const topPatterns = Object.entries(duplicatePatterns)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        topPatterns.forEach(([pattern, count], idx) => {
            console.log(`   ${idx + 1}. ${pattern} (${count} occurrences)`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('\n💡 NEXT STEPS:\n');

        if (wouldUpdateCount > 0) {
            console.log('   ✅ Run the actual migration to apply these changes:');
            console.log('      npx ts-node src/scripts/migrate-normalize-materials.ts\n');
            console.log('   ⚠️  Recommended: Backup your database first:');
            console.log('      npx prisma db pull\n');
        } else {
            console.log('   ✅ All data is already clean! No migration needed.\n');
        }

        console.log('='.repeat(70));

    } catch (error: any) {
        console.error('❌ Dry run failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run dry-run
dryRunMigration()
    .then(() => {
        console.log('\n✅ Dry run completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Dry run failed:', error);
        process.exit(1);
    });
