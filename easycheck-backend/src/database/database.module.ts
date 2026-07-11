import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USE_DATABASE } from './use-database';

/**
 * Conexión raíz a Postgres. Solo se activa cuando `DB_HOST` está definido
 * (modo Docker Compose); sin la variable este módulo no importa nada y el
 * backend queda 100 % in-memory (modo tests/local).
 */
@Module({
  imports: USE_DATABASE
    ? [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT ?? '5432', 10),
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          // Registra automáticamente las entities de los forFeature().
          autoLoadEntities: true,
          // ⚠️ SOLO DESARROLLO/DEMO: synchronize:true regenera el esquema
          // desde las entities en cada arranque. En producción esto puede
          // DESTRUIR datos ante un cambio de modelo — ahí se reemplaza por
          // migraciones de TypeORM (migrationsRun + archivos de migración).
          synchronize: true,
        }),
      ]
    : [],
})
export class DatabaseModule {}
