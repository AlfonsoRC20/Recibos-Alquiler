# Seguridad y privacidad

## Reglas del repositorio

- No subir contratos, recibos, hojas de cálculo ni copias de DNI.
- No subir archivos `.env` ni claves. La clave `service_role` de Supabase no
  debe estar nunca en el código.
- Los datos reales viven en `datos-reales/` (ignorada por Git).
- Si se sube un dato sensible por error, borrarlo con un commit **no basta**:
  sigue en el historial. Hay que reescribir el historial o crear un repositorio nuevo.

## Revisión antes de hacer público el repositorio

```
git log -p | grep -iE "dni|iban|@|\+34|\+39"
```

## Aviso

Este proyecto trata datos personales de terceros. Quien lo use es responsable
de cumplir el RGPD y la normativa aplicable.

## Notas sobre los recibos

Los PDF se generan sin firma digital. Si necesitas firmarlos, hazlo después
con una herramienta como Autofirma.

## Reportar un problema de seguridad

Abre un *Security advisory* privado en la pestaña Security del repositorio.
