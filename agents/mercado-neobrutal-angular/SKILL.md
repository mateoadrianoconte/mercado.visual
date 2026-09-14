---
name: mercado-neobrutal-angular
description: Diseña e implementa el frontend Angular del módulo Mercado de la plataforma gamificada, especialmente catálogo, compra, inventario visual y futuras subastas, siguiendo el sistema neobrutalista arcade oscuro y serigrafía claro establecido. No usar para otros módulos o estilos visuales salvo pedido explícito.
---

# Mercado neobrutalista en Angular

Construir una interfaz con personalidad arcade/serigrafía, enérgica pero ordenada. Mantener la misma gramática visual en todo Mercado; no producir una interpretación genérica del neobrutalismo ni mezclar estilos de librerías externas.

## Contexto funcional

Mercado pertenece a una plataforma educativa gamificada. El alumno usa monedas obtenidas dentro de un curso para adquirir vidas o equipamiento. En la primera implementación, el catálogo y sus datos son locales y están hardcodeados en el frontend. Preparar la UI para que esos datos puedan reemplazarse luego por un servicio HTTP sin rediseñar los componentes.

No inventar integraciones con backend. Cuando una acción sea simulada, mantenerla claramente como estado local de demostración.

## Referencia visual obligatoria

La identidad tiene dos temas equivalentes:

- `arcade-dark`: fondo casi negro con matiz azul/violeta, superficies berenjena, texto claro y acentos amarillos, violetas, fucsias y cian.
- `serigraphy-light`: fondo blanco grisáceo, superficies claras, tinta azul-negra, mostaza en acciones principales y los mismos acentos violeta, fucsia y cian.

Ambos temas deben conservar la misma estructura, jerarquía, bordes y geometría. El tema claro no es una versión desaturada del oscuro: usa contraste de tinta impresa y sombras negras. El oscuro no debe convertirse en una interfaz de neón con brillos.

Rasgos innegociables:

- Bordes rectos visibles de `3px` en cards, controles y botones relevantes.
- Radio `0`; no usar esquinas redondeadas, pills ni cards suaves.
- Sombras duras desplazadas, sin blur: normalmente `5px 5px 0`.
- Controles compactos, bloques rectangulares y composición en grilla.
- Etiquetas pequeñas en mayúsculas, espaciadas y con aire retro/pixel.
- Cuerpo de texto limpio y muy legible; reservar la tipografía pixel para títulos cortos, labels, contadores y badges.
- Acentos intensos usados con función; no cubrir toda la pantalla con colores saturados.

Evitar gradientes, glassmorphism, blur, sombras suaves, transparencias decorativas, ilustraciones 3D, exceso de stickers y animaciones elásticas.

## Tokens visuales

Definir tokens globales con custom properties y consumirlos desde los componentes. Estos valores son la base; ajustar solo cuando el proyecto ya tenga tokens oficiales equivalentes.

```scss
:root,
[data-theme='serigraphy-light'] {
  --mk-bg: #f4f5f7;
  --mk-surface: #ffffff;
  --mk-surface-muted: #e8ebf1;
  --mk-ink: #141321;
  --mk-text: #191824;
  --mk-text-muted: #6f6b78;
  --mk-primary: #d58d00;
  --mk-yellow: #ffd21a;
  --mk-purple: #8238ef;
  --mk-pink: #f02b83;
  --mk-cyan: #08b7d6;
  --mk-success: #d58d00;
  --mk-danger: #f02b83;
  --mk-border: 3px solid var(--mk-ink);
  --mk-shadow: 5px 5px 0 var(--mk-ink);
}

[data-theme='arcade-dark'] {
  --mk-bg: #0d0b1d;
  --mk-surface: #211a3a;
  --mk-surface-muted: #17122e;
  --mk-ink: #f4f2fb;
  --mk-text: #f5f3fb;
  --mk-text-muted: #aaa3c0;
  --mk-primary: #ffd21a;
  --mk-yellow: #ffd21a;
  --mk-purple: #8238ef;
  --mk-pink: #ff318a;
  --mk-cyan: #08c0df;
  --mk-success: #ffd21a;
  --mk-danger: #ff318a;
  --mk-border: 3px solid var(--mk-ink);
  --mk-shadow: 5px 5px 0 #05040d;
}
```

Usar una escala de espaciado basada en `4px`: `4, 8, 12, 16, 24, 32, 48`. El contenido principal debe tener un ancho máximo legible y márgenes amplios; no pegar la grilla a los bordes de la ventana.

## Tipografía e iconografía

Usar una fuente display pixel/arcade ya disponible localmente para labels y títulos breves. Si el proyecto no provee una, usar temporalmente `ui-monospace, SFMono-Regular, Consolas, monospace` y dejar el reemplazo centralizado en un token. Para descripciones, precios largos y ayudas usar una sans legible del proyecto o `Inter, system-ui, sans-serif`.

No cargar fuentes desde CDN sin autorización. Usar SVG o el set de iconos existente; no usar emojis como iconografía final. Los iconos deben heredar color y tener texto accesible cuando la acción no sea evidente.

## Arquitectura Angular

Trabajar con Angular y SCSS puro. No incorporar Tailwind, Bootstrap, Angular Material u otra librería de componentes salvo pedido explícito.

Preferir componentes standalone si el proyecto ya sigue ese enfoque. Separar datos, presentación y estado de interacción:

- Mantener el catálogo hardcodeado en un archivo o servicio mock tipado, nunca repetido dentro del template.
- Definir un modelo `CatalogItem` con identificador, nombre, descripción, tipo (`LIFE` o `EQUIPMENT`), precio, imagen/icono, estado y efecto opcional.
- Exponer los datos como `readonly` y usar IDs estables.
- Renderizar productos con `@for (...; track item.id)` en versiones modernas de Angular; respetar la sintaxis ya usada por el repositorio si es anterior.
- Mantener cada componente enfocado: página, barra de estado/saldo, filtros, grilla, card, detalle/confirmación y feedback.
- Evitar lógica compleja en el HTML y estilos inline.
- Preparar el acceso a datos detrás de una interfaz simple para poder cambiar el mock por `HttpClient` más adelante.

No reestructurar carpetas, actualizar Angular ni instalar dependencias solo para aplicar esta skill.

## Catálogo de Mercado

La pantalla debe sentirse como una tienda arcade y permitir entender en pocos segundos qué puede comprar el alumno y cuánto puede gastar.

Incluir, cuando el alcance lo permita:

- Encabezado corto con título de Mercado y contexto del curso.
- Saldo de monedas muy visible, acompañado por vidas vigentes.
- Filtros rectangulares para `Todos`, `Vidas` y `Equipamiento`.
- Búsqueda solo si aporta valor con la cantidad real de productos; no agregarla a una lista mínima por costumbre.
- Grilla de cards con nombre, tipo, precio, efecto breve, disponibilidad y acción de compra.
- Estado seleccionado claro mediante color, borde y desplazamiento, no solo por color.
- Confirmación de compra con producto, precio, saldo previo y saldo resultante.
- Estados vacío, sin resultados, saldo insuficiente, agotado/no disponible, procesando, éxito y error.

Las cards deben tener alturas coherentes, CTA alineada y jerarquía estable aunque cambie el largo de la descripción. Limitar texto o reservar espacio; no permitir que una card rompa toda la fila.

En el estado inicial hardcodeado, la compra puede actualizar un saldo local solo si el usuario pide interacción funcional. No simular persistencia entre sesiones.

## Componentes y estados

- Botón primario: fondo amarillo en oscuro y mostaza en claro, tinta contrastante, borde de `3px` y sombra dura.
- Botón secundario: superficie del tema, borde fuerte y sombra menor o nula.
- Hover: desplazar `1–2px` hacia la sombra y reducir su offset; duración `100–160ms`.
- Active: casi eliminar el offset para dar sensación de botón presionado.
- Focus visible: outline doble o contraste equivalente; nunca retirar el focus sin reemplazo.
- Disabled: reducir contraste, quitar sombra de acción y conservar el texto legible; no depender solo de opacidad extrema.
- Inputs/selects: rectangulares, superficie contrastante, borde fuerte, label superior en mayúsculas.
- Badges: pequeños y rectangulares; fucsia para riesgo/agotado, cian para información, amarillo/mostaza para éxito o valor principal, violeta para equipamiento.
- Feedback: mostrar texto concreto, no depender únicamente del cambio de color.

No usar modales genéricos redondeados. Si se necesita confirmación, aplicar el mismo borde, sombra, tokens y tipografía de Mercado.

## Temas

Controlar el tema mediante un atributo estable como `data-theme` en un contenedor alto o en `html`. Los componentes solo consumen tokens: no duplicar hojas completas por tema.

Soportar:

- Preferencia del sistema como valor inicial cuando no exista una elección guardada.
- Cambio manual de tema si la aplicación ya ofrece selector.
- Persistencia de la preferencia solo mediante el mecanismo existente del proyecto; no crear almacenamiento paralelo sin necesidad.
- Contraste WCAG AA para texto y controles, incluso cuando se usen colores de acento.

## Layout y adaptación

Diseñar primero para escritorio, coherente con el alcance del producto. Usar CSS Grid con columnas fluidas y un ancho mínimo de card razonable. En anchos estrechos, evitar desbordes y mantener legibles los estados, aunque el catálogo completo pueda mostrar el aviso de que requiere computadora según las reglas del producto.

No crear una experiencia móvil completa ni cambiar esa regla funcional sin pedido. Sí asegurar que el aviso y la estructura general no se rompan.

## Movimiento y accesibilidad

La interacción debe sentirse inmediata y mecánica:

- Solo transiciones breves de transformación, color o sombra.
- Respetar `prefers-reduced-motion`.
- Mantener orden de tabulación lógico, labels reales, estados anunciables y objetivos de interacción suficientes.
- No comunicar precio, disponibilidad o selección exclusivamente mediante color.
- Toda imagen de producto necesita `alt` útil; las puramente decorativas usan `alt=""`.

## Futuras pantallas de Mercado

Reutilizar los mismos tokens y componentes en detalle de producto, historial de compras, inventario visual y subastas. Las subastas deben diferenciar saldo disponible de monedas reservadas y hacer visible el tiempo restante, pero no implementar reglas de negocio o integraciones hasta que formen parte del alcance solicitado.

## Forma de trabajo

Antes de editar:

1. Inspeccionar la estructura y versión de Angular, los estilos globales, los componentes compartidos y las instrucciones del repositorio.
2. Reutilizar convenciones compatibles y evitar modificaciones globales que afecten otros módulos.
3. Si existe una discrepancia entre esta identidad y un Design System oficial, informarla y aplicar la fuente de verdad indicada por el usuario.

Durante la implementación, revisar al menos los estados normal, hover, focus, active, disabled, saldo insuficiente y tema claro/oscuro. Al terminar, ejecutar los chequeos disponibles del proyecto y revisar visualmente ambos temas a ancho de escritorio.

## Criterio de terminado

El resultado está listo cuando:

- Se reconoce la identidad arcade/serigrafía de las referencias sin explicación adicional.
- Claro y oscuro son coherentes y no duplican la implementación.
- El catálogo hardcodeado está tipado, centralizado y preparado para reemplazo por API.
- Los controles tienen estados completos y accesibles.
- No aparecen bordes redondeados, sombras suaves ni estilos ajenos al sistema.
- La grilla permanece ordenada con contenidos de distinta longitud.
- Los chequeos de Angular pasan y ambos temas fueron inspeccionados visualmente.
