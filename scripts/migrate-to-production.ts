/**
 * Migration script: SQLite (Development) -> PostgreSQL (Production)
 *
 * This script handles data migration from the development SQLite database
 * to a production PostgreSQL database via Supabase.
 *
 * Usage:
 * npx ts-node scripts/migrate-to-production.ts
 */

import prisma from '@/lib/prisma';
import { testSupabaseConnection } from '@/lib/supabase';

interface MigrationResult {
  table: string;
  count: number;
  success: boolean;
  error?: string;
}

const results: MigrationResult[] = [];

async function migrateTable(
  tableName: string,
  model: { count: () => Promise<number> }
): Promise<MigrationResult> {
  try {
    const count = await model.count();
    console.log(`✓ ${tableName}: ${count} registros`);
    return { table: tableName, count, success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`✗ ${tableName}: ${errorMsg}`);
    return { table: tableName, count: 0, success: false, error: errorMsg };
  }
}

async function runMigration() {
  console.log('🚀 Iniciando migración de datos...\n');

  // Test Supabase connection first
  console.log('🔍 Verificando conexión a Supabase...');
  const supabaseConnected = await testSupabaseConnection();

  if (!supabaseConnected) {
    console.error('✗ No se puede conectar a Supabase. Verifica tu DATABASE_URL');
    process.exit(1);
  }

  console.log('✓ Conexión a Supabase confirmada\n');

  // Begin migration
  console.log('📊 Contando registros en cada tabla...\n');

  try {
    // Migrate all tables
    results.push(await migrateTable('users', prisma.user));
    results.push(await migrateTable('redes', prisma.red));
    results.push(await migrateTable('hermanos', prisma.hermano));
    results.push(await migrateTable('eventos', prisma.evento));
    results.push(await migrateTable('anuncios', prisma.anuncio));
    results.push(await migrateTable('asistencias', prisma.asistencia));
    results.push(await migrateTable('seguimientos', prisma.seguimiento));
    results.push(await migrateTable('visitas', prisma.visita));
    results.push(await migrateTable('peticiones de oración', prisma.peticionOracion));
    results.push(await migrateTable('documentos', prisma.documento));
    results.push(await migrateTable('permisos', prisma.permiso));
    results.push(await migrateTable('cuotas', prisma.cuota));
    results.push(await migrateTable('metas financieras', prisma.metaFinanciera));
    results.push(await migrateTable('notificaciones', prisma.notificacion));
    results.push(await migrateTable('mensajes WhatsApp', prisma.mensajeWhatsApp));

    // Summary
    console.log('\n📈 Resumen de migración:\n');
    let totalRecords = 0;
    const successCount = results.filter(r => r.success).length;

    results.forEach(result => {
      if (result.success) {
        totalRecords += result.count;
      }
    });

    console.log(`Total de registros: ${totalRecords}`);
    console.log(`Tablas sincronizadas: ${successCount}/${results.length}`);

    if (successCount === results.length) {
      console.log('\n✅ Migración completada exitosamente');
      console.log('\n📋 Próximos pasos:');
      console.log('1. Verifica que todos los datos estén en Supabase');
      console.log('2. Configura Clerk para autenticación');
      console.log('3. Prueba la aplicación en producción');
      console.log('4. Actualiza la URL en el navegador a tu dominio de producción');
    } else {
      console.log('\n⚠️  Algunos registros no se migraron correctamente');
      console.log('Revisa los errores anteriores');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
