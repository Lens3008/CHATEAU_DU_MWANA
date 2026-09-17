# Guide de Sauvegarde et Restauration (Disaster Recovery Plan)

Ce document décrit les procédures de sauvegarde et de restauration pour les données du Château du Mwana.

## 1. PostgreSQL (Base de données)

### Sauvegarde (Backup)
Supabase effectue des sauvegardes automatiques quotidiennes (Point-in-Time Recovery ou PITR sur les plans Pro).
Pour déclencher une sauvegarde manuelle :
```bash
# Avec Supabase CLI
supabase db dump --data-only -f backup_data.sql

# Avec pg_dump standard
pg_dump postgresql://postgres.[PROJET_ID]:[MOT_DE_PASSE]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres > backup_full.sql
```

### Restauration (Restore)
En cas de sinistre, pour injecter les données dans une instance vierge :
```bash
psql -h aws-0-eu-west-3.pooler.supabase.com -U postgres -d postgres -f backup_data.sql
```
Si vous utilisez Supabase Dashboard, vous pouvez restaurer directement à un point dans le temps depuis l'interface `Database > Backups`.

## 2. Supabase Storage (Médias, Fichiers, Factures)

Les fichiers uploadés par les utilisateurs (images CMS, justificatifs, avatars) sont stockés dans Supabase Storage.

### Sauvegarde
L'outil officiel pour copier un bucket entier en local :
```bash
# Nécessite AWS CLI configuré avec les clés S3 Supabase
aws s3 sync s3://[mon-bucket-supabase] ./backup-storage --endpoint-url https://[PROJET_ID].supabase.co/storage/v1/s3
```

### Restauration
Pour recharger des fichiers dans le Storage :
```bash
aws s3 sync ./backup-storage s3://[mon-bucket-supabase] --endpoint-url https://[PROJET_ID].supabase.co/storage/v1/s3
```

## 3. Procédure de Migration (Staging -> Prod)

- Évitez de copier des données de production vers le staging sans les avoir préalablement anonymisées (RGPD).
- Les modifications de schéma Prisma doivent TOUJOURS passer par `npx prisma migrate deploy` dans le pipeline CI/CD, jamais en modifiant manuellement le schéma en production.

> [!WARNING]
> Avant toute migration majeure ou déploiement de nouvelle version (Phase), déclenchez toujours un backup manuel complet (`pg_dump`).
