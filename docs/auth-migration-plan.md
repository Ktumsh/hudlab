# Migración de Autenticación Cross-Domain

## Estado Actual

Actualmente HUDLab utiliza una solución temporal para manejar la autenticación entre dominios separados:

- **Frontend**: `hudlab.vercel.app`
- **Backend/API**: `api-hudlab.vercel.app`

### Problema Principal

NextAuth.js almacena cookies de sesión en el dominio del backend (`api-hudlab.vercel.app`), pero el middleware y componentes server-side del frontend no pueden acceder a estas cookies debido a las políticas de seguridad de los navegadores (cookies están aisladas por dominio).

### Solución Temporal Implementada

Se implementó un sistema de "cookies espejo" (`hudlab_auth`) que:

1. **Backend** (`/api/session-mirror`): Genera tokens HMAC ligeros con `userId:username:expiration`
2. **Frontend** (hook `useAuth`): Sincroniza estas cookies espejo cada 2 minutos
3. **Middleware**: Lee las cookies espejo para decisiones de routing (no para autorización real)
4. **Server Components**: Usan `getServerAuthFromMirror()` para acceso básico al estado de usuario

**Limitaciones de la solución actual:**

- Cookies espejo expiran cada 5 minutos (requieren resincronización constante)
- No contienen información completa del usuario (solo ID y username)
- Dependiente de JavaScript para funcionar (no funciona con JS deshabilitado)
- Latencia entre cambios de autenticación real y reflejos en las cookies espejo

## Soluciones Recomendadas a Futuro

### Opción 1: Dominio Unificado (RECOMENDADO)

**Migrar a un dominio propio con subdominios:**

```
Frontend: app.hudlab.com (o hudlab.com)
Backend:  api.hudlab.com
```

**Configuración necesaria:**

```typescript
// hudlab-api/app/auth.config.ts
cookies: {
  sessionToken: {
    options: {
      domain: ".hudlab.com", // Permite compartir entre subdominios
      secure: true,
      sameSite: "lax",
    }
  }
}
```

**Ventajas:**

- ✅ Cookies nativas de NextAuth funcionan automáticamente
- ✅ No requiere sincronización manual
- ✅ Mejor seguridad (cookies HttpOnly reales)
- ✅ Funciona sin JavaScript
- ✅ Menor complejidad de código

**Pasos de migración:**

1. Adquirir dominio personalizado (ej: `hudlab.com`)
2. Configurar DNS con subdominios
3. Actualizar variables de entorno:
   ```env
   FRONTEND_URL=https://hudlab.com
   AUTH_URL=https://api.hudlab.com
   COOKIE_DOMAIN=.hudlab.com
   ```
4. Remover sistema de cookies espejo
5. Revertir a `getServerAuth` original en todos los componentes

### Opción 2: Arquitectura Unificada

**Servir API desde el mismo dominio del frontend:**

Usar rewrites de Next.js para proxy:

```typescript
// next.config.ts
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'https://api-hudlab.vercel.app/api/:path*'
    }
  ]
}
```

**Ventajas:**

- ✅ Mismo dominio = cookies funcionan naturalmente
- ✅ Mantiene separación lógica de servicios
- ✅ No requiere dominio personalizado

**Desventajas:**

- ❌ Todas las requests API pasan por el frontend (latencia adicional)
- ❌ Límites de bandwidth del plan de Vercel
- ❌ Complejidad en el debugging de requests

### Opción 3: Migración a App Router Completo

**Mover autenticación al frontend usando Auth.js v5:**

```typescript
// hudlab-web/auth.ts
export const { auth, signIn, signOut } = NextAuth({
  providers: [
    /* mismos providers */
  ],
  // Toda la lógica de auth en el frontend
});
```

**Arquitectura resultante:**

- Frontend: Maneja autenticación + UI
- Backend: Solo API de datos (sin auth)

**Ventajas:**

- ✅ Simplicidad total (un solo dominio)
- ✅ Mejor performance (menos requests cross-domain)
- ✅ Ecosistema Auth.js completo disponible

**Desventajas:**

- ❌ Requiere migración significativa del backend
- ❌ Pérdida de separación clara frontend/backend

## Plan de Migración Recomendado

### Fase 1: Preparación (1-2 semanas)

1. Adquirir dominio personalizado
2. Configurar DNS y certificados SSL
3. Actualizar configuraciones de producción
4. Testear en staging

### Fase 2: Migración (1 semana)

1. Desplegar ambos servicios en nuevos subdominios
2. Actualizar `COOKIE_DOMAIN=.hudlab.com`
3. Reemplazar `getServerAuthFromMirror` → `getServerAuth`
4. Remover sistema de cookies espejo

### Fase 3: Limpieza (1 semana)

1. Eliminar código relacionado con cookies espejo:
   - `/lib/server-auth-mirror.ts`
   - `/api/session-mirror/route.ts`
   - `/lib/session-mirror-token.ts`
   - Lógica de sincronización en `useAuth`
2. Simplificar middleware (remover parsing de cookies espejo)
3. Actualizar documentación

### Fase 4: Optimización

1. Configurar CDN para assets estáticos
2. Optimizar performance con nuevos subdominios
3. Implementar monitoring mejorado

## Consideraciones de Seguridad

### Cookies con Dominio Compartido

```typescript
// Configuración segura recomendada
cookies: {
  sessionToken: {
    name: "__Secure-authjs.session-token",
    options: {
      httpOnly: true,      // Previene acceso desde JavaScript
      secure: true,        // Solo HTTPS
      sameSite: "lax",     // Balance seguridad/funcionalidad
      domain: ".hudlab.com", // Compartir entre subdominios
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 días
    }
  }
}
```

### Headers de Seguridad

```typescript
// next.config.ts - Headers adicionales para seguridad
headers: [
  {
    source: "/(.*)",
    headers: [
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
    ],
  },
];
```

## Monitoreo Post-Migración

### Métricas a Monitorear

- Tasa de éxito de login/logout
- Latencia de requests de autenticación
- Errores de cookies expiradas
- Performance de middleware

### Alertas Recomendadas

- Fallos de autenticación > 5% en 5 minutos
- Latencia de `/api/user` > 500ms
- Errores de cookies inválidas

## Costo-Beneficio

### Opción 1 (Dominio Propio)

- **Costo**: ~$12/año dominio + tiempo desarrollo (2-3 semanas)
- **Beneficio**: Arquitectura limpia, mantenimiento reducido, mejor UX

### Mantener Status Quo

- **Costo**: Mantenimiento continuo del sistema espejo, debugging complejo
- **Beneficio**: No requiere cambios inmediatos

**Recomendación**: La inversión en dominio propio se amortiza rápidamente por la reducción de complejidad y mejor experiencia de desarrollo.
