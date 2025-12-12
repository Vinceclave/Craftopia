// Migration script to normalize existing materials in the database
// Run with: npx ts-node src/scripts/migrate-normalize-materials.ts

import prisma from '../config/prisma';
import { testNormalization } from '../ai/services/material.service';

interface CraftWithMaterials {
    idea_id: number;
    recycled_materials: any;
}

async function migrateMaterials() {
    console.log('🔄 Starting material normalization migration...\n');

    try {
        // Fetch all craft ideas with materials
        const crafts = await prisma.craftIdea.findMany({
            where: {
                deleted_at: null
            },
            select: {
                idea_id: true,
                recycled_materials: true
            }
        });

        console.log(`📊 Found ${crafts.length} craft ideas with materials\n`);

        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const craft of crafts) {
            try {
                // Extract materials array
                let materials: string[] = [];

                if (Array.isArray(craft.recycled_materials)) {
                    materials = craft.recycled_materials.filter((m): m is string => typeof m === 'string');
                } else if (typeof craft.recycled_materials === 'object' && craft.recycled_materials !== null) {
                    // Handle case where it might be stored differently
                    const materialsObj = craft.recycled_materials as any;
                    if (Array.isArray(materialsObj.materials)) {
                        materials = materialsObj.materials;
                    }
                }

                if (materials.length === 0) {
                    console.log(`⏭️  Skipping craft ${craft.idea_id} - no materials found`);
                    skippedCount++;
                    continue;
                }

                // Normalize materials
                const normalizedMaterials = testNormalization(materials);

                // Check if normalization made any changes
                const hasChanges = JSON.stringify(materials.sort()) !== JSON.stringify(normalizedMaterials.sort());

                if (hasChanges) {
                    console.log(`\n📝 Craft ID ${craft.idea_id}:`);
                    console.log(`   Before (${materials.length}):`, materials.slice(0, 3).join(', ') + (materials.length > 3 ? '...' : ''));
                    console.log(`   After (${normalizedMaterials.length}):`, normalizedMaterials.join(', '));

                    // Update the database
                    await prisma.craftIdea.update({
                        where: { idea_id: craft.idea_id },
                        data: {
                            recycled_materials: normalizedMaterials as any
                        }
                    });

                    updatedCount++;
                } else {
                    skippedCount++;
                }

            } catch (error: any) {
                console.error(`❌ Error processing craft ${craft.idea_id}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Migration completed!\n');
        console.log(`📊 Summary:`);
        console.log(`   Total crafts: ${crafts.length}`);
        console.log(`   Updated: ${updatedCount}`);
        console.log(`   Skipped (no changes): ${skippedCount}`);
        console.log(`   Errors: ${errorCount}`);
        console.log('='.repeat(60));

    } catch (error: any) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateMaterials()
    .then(() => {
        console.log('\n✅ Migration script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Migration script failed:', error);
        process.exit(1);
    });
