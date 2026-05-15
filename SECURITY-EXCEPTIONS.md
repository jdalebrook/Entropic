# Excepciones de seguridad conocidas

## CVE: GHSA-qx2v-qp2m-jg93 — PostCSS XSS via unescaped `</style>`

**Estado:** RESUELTA mediante override  
**Fecha detección:** 2026-05-15  
**Severidad:** Moderate

**Descripción:** PostCSS < 8.5.10 podía generar salida CSS con `</style>` sin escapar,
lo que permitía XSS si esa salida se inyectaba en HTML sin sanitizar.

**Origen:** `next@16.2.6` bundleaba internamente una versión de `postcss` afectada.
El `npm audit fix --force` habría degradado Next.js a 9.3.3, lo que no era viable.

**Resolución:** Override en `package.json` para forzar `postcss >= 8.5.10` en todo el
árbol de dependencias:

```json
"overrides": {
  "postcss": ">=8.5.10"
}
```

**Riesgo residual en el período sin fix:** Bajo. PostCSS se usa como build tool, no
en el servidor de producción en runtime. La superficie de ataque requería que la salida
CSS compilada se inyectara directamente en HTML sin sanitizar, escenario que no ocurre
en este proyecto.

**Acción futura:** Cuando Next.js actualice su dependencia interna de postcss por encima
de 8.5.10, el override puede eliminarse sin impacto.
