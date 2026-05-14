# Guía de Deploy — Railway

## Variables de entorno

### Backend (`polleria-backend`)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Entorno de ejecución |
| `PORT` | `3000` | Railway lo inyecta automáticamente — no setear |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Referenciar el plugin de Postgres |
| `JWT_SECRET` | *(generado)* | Mínimo 32 chars. **NUNCA commitear.** |
| `JWT_EXPIRES_IN` | `8h` | Tiempo de vida del token |
| `CORS_ORIGIN` | `https://polleria-front.up.railway.app` | Dominio público del frontend |
| `GOOGLE_SMTP_USER` | `tucuenta@gmail.com` | Cuenta Gmail remitente de emails de recupero |
| `GOOGLE_SMTP_APP_PASSWORD` | `xxxx xxxx xxxx xxxx` | App Password de Google. **NUNCA commitear.** |

**Generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend (`polleria-frontend`)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `VITE_API_URL` | `https://polleria-back.up.railway.app` | Dominio público del backend |

---

## Variables de entorno para desarrollo local

Crear `backend/.env` (no se commitea):
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://polleria:polleria_dev@localhost:5432/polleria_db
JWT_SECRET=<min-32-chars-secret-for-local-dev-only>
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
GOOGLE_SMTP_USER=tucuenta@gmail.com
GOOGLE_SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

Crear `frontend/.env` (no se commitea):
```
VITE_API_URL=http://localhost:3000
```

---

## Setup de servicios en Railway

### Paso 1: Crear proyecto

En el dashboard de Railway → New Project → Empty Project.

### Paso 2: Agregar PostgreSQL

Add Service → Database → PostgreSQL. Railway provee `DATABASE_URL` automáticamente.

### Paso 3: Agregar backend

Add Service → GitHub Repo → seleccionar el repo.

Configurar en Settings:
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `node dist/main`
- **Release Command:** `npm run migration:run`

Variables de entorno: copiar la tabla de arriba, usar `${{Postgres.DATABASE_URL}}` para la DB.

### Paso 4: Agregar frontend

Add Service → GitHub Repo → mismo repo.

Configurar en Settings:
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** (Nixpacks sirve los estáticos automáticamente)

Variable de entorno: `VITE_API_URL` apuntando al dominio del backend.

### Paso 5: Verificar

```bash
# Health check del backend
curl https://<backend-domain>/api/health
# Esperado: { "status": "ok", "database": "ok", "uptime": ... }
```

---

## Troubleshooting

### Migration falla en release command

```bash
# Ver logs del deploy
railway logs

# Revertir la última migration (si el schema quedó inconsistente)
railway run --service polleria-backend npm run migration:revert
```

### CORS error en el frontend

Verificar que `CORS_ORIGIN` en el backend apunta **exactamente** al dominio del frontend (sin trailing slash).

### Token rechazado con 401

- Verificar que `JWT_SECRET` es el mismo en todos los deployments (no regenerar entre deploys).
- Verificar que `JWT_EXPIRES_IN` no es demasiado corto.

### Email de recupero no llega

- Verificar que `GOOGLE_SMTP_USER` y `GOOGLE_SMTP_APP_PASSWORD` están correctamente seteados en Railway.
- La App Password se genera en: Google Account → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones.
- Gmail puede bloquear el envío si la cuenta no tiene verificación en 2 pasos activa — es requisito para App Passwords.
- Revisar la carpeta de spam del destinatario.

### Frontend no puede conectar al backend

Verificar que `VITE_API_URL` apunta al dominio correcto del backend. Rebuild el frontend después de cambiar variables `VITE_*`.

---

## Ciclo de deploy normal

```
git push origin main
  └─ Railway detecta el cambio
       ├─ polleria-backend: build → release (migration:run) → start
       └─ polleria-frontend: build → serve estáticos
```

Los dos servicios se rebuildan en paralelo. Si el backend falla en el release command, el deploy se cancela y el servicio anterior sigue corriendo (zero downtime en caso de fallo de migration).
