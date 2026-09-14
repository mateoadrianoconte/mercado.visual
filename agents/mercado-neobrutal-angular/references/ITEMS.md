# Sistema visual de ítems de Mercado

Este documento es la fuente de verdad para diseñar e implementar todos los ítems del catálogo de Mercado. Codex debe leerlo antes de crear, modificar o animar una card de producto.

## Referencia aprobada

La card del ítem **Escudo** aprobada por el equipo define el estilo canónico. Todos los ítems nuevos deben sentirse parte de la misma colección: arcade oscuro, pixel art moderno y composición neobrutalista.

La referencia tiene estas características obligatorias:

- Fondo general azul-negro con matiz violeta.
- Card vertical oscura con borde claro grueso.
- Esquinas completamente rectas.
- Sombra negra dura, desplazada y sin desenfoque.
- Panel de ilustración violeta con marco fucsia.
- Objeto principal grande, centrado y dibujado como pixel art limpio.
- Nombre en mayúsculas, blanco y con tipografía arcade gruesa.
- Efecto en una línea corta, con letras pequeñas y espaciadas.
- Moneda amarilla pixelada al lado del precio.
- Botón amarillo rectangular con texto oscuro.
- Pequeños destellos alrededor del objeto para reforzar su carácter especial.

No reinterpretar el diseño como una card minimalista genérica. No usar gradientes suaves, bordes redondeados, glassmorphism, sombras difuminadas, fotografías, render 3D realista ni estilos de Angular Material, Bootstrap o Tailwind.

## Qué se conserva y qué puede cambiar

### Se conserva en todos los ítems

- Tamaño y proporción de la card.
- Distribución vertical de ilustración, nombre, efecto, precio y botón.
- Grosor de bordes.
- Dirección e intensidad de la sombra.
- Tipografías y jerarquías.
- Tamaño del panel de ilustración.
- Posición del precio y del CTA.
- Comportamiento de hover, teclado y movimiento reducido.
- Contraste y estética arcade-neobrutalista.

### Cambia según el ítem

- Ilustración central.
- Nombre.
- Descripción del efecto.
- Precio.
- Color secundario del panel, dentro de la paleta permitida.
- Forma y ubicación exacta de los destellos.
- Estado: disponible, saldo insuficiente, agotado o próximamente.

Los colores secundarios permitidos son violeta, fucsia, amarillo y cian. No asignar un color aleatorio fuera de esta paleta.

## Anatomía obligatoria de la card

Cada card debe contener, en este orden:

1. Panel visual del producto.
2. Ilustración del objeto.
3. Destellos decorativos separados de la ilustración.
4. Nombre del ítem.
5. Efecto o beneficio resumido.
6. Precio con icono de moneda.
7. Botón de acción.

La ilustración y los destellos deben ser elementos separados. No incrustar los destellos dentro de la imagen principal porque necesitan animarse individualmente.

La card completa no debe ser una sola imagen. La imagen aprobada del Escudo es la referencia de composición; la implementación real debe recrearse con HTML, SCSS y assets separados para conservar accesibilidad, contenido dinámico y animaciones.

## Tokens base

```scss
:root {
  --item-bg: #0d0b1d;
  --item-card: #19152f;
  --item-panel: #672ee8;
  --item-panel-bright: #8238ef;
  --item-ink: #f5f3fb;
  --item-shadow: #05040d;
  --item-yellow: #ffd21a;
  --item-pink: #ff318a;
  --item-cyan: #08c0df;
  --item-muted: #aaa3c0;
  --item-border: 3px solid var(--item-ink);
  --item-shadow-rest: 6px 6px 0 var(--item-shadow);
  --item-shadow-hover: 10px 14px 0 var(--item-shadow);
}
```

## Modelo Angular

El catálogo inicial estará hardcodeado, pero los datos deben centralizarse y estar tipados para poder reemplazarlos después por una API.

```ts
export type MarketItemStatus =
  | 'AVAILABLE'
  | 'INSUFFICIENT_FUNDS'
  | 'SOLD_OUT'
  | 'COMING_SOON';

export interface MarketItem {
  readonly id: string;
  readonly name: string;
  readonly effect: string;
  readonly price: number;
  readonly imageUrl: string;
  readonly imageAlt: string;
  readonly accent: 'PURPLE' | 'PINK' | 'YELLOW' | 'CYAN';
  readonly status: MarketItemStatus;
}
```

Ejemplo canónico:

```ts
export const MARKET_ITEMS: readonly MarketItem[] = [
  {
    id: 'shield',
    name: 'ESCUDO',
    effect: 'PROTEGE UNA VIDA',
    price: 500,
    imageUrl: 'assets/market/items/shield.png',
    imageAlt: 'Escudo protector violeta',
    accent: 'PURPLE',
    status: 'AVAILABLE'
  }
];
```

No duplicar estos datos dentro del template. Renderizar la colección con `@for (item of items; track item.id)` cuando la versión de Angular lo permita.

## Estructura Angular sugerida

```html
<article
  class="item-card"
  [class]="'item-card item-card--' + item.accent.toLowerCase()"
  tabindex="0"
>
  <div class="item-card__visual">
    <img
      class="item-card__image"
      [src]="item.imageUrl"
      [alt]="item.imageAlt"
    >

    <span class="item-card__spark item-card__spark--1" aria-hidden="true">✦</span>
    <span class="item-card__spark item-card__spark--2" aria-hidden="true">✦</span>
    <span class="item-card__spark item-card__spark--3" aria-hidden="true">✚</span>
  </div>

  <h3 class="item-card__name">{{ item.name }}</h3>
  <p class="item-card__effect">{{ item.effect }}</p>

  <div class="item-card__price" [attr.aria-label]="item.price + ' monedas'">
    <span class="item-card__coin" aria-hidden="true"></span>
    <span>{{ item.price }}</span>
  </div>

  <button
    class="item-card__button"
    type="button"
    [disabled]="item.status !== 'AVAILABLE'"
  >
    COMPRAR
  </button>
</article>
```

Si el repositorio ya posee un componente de icono, reemplazar los caracteres de destello por SVG sin alterar la composición.

## Animación obligatoria

La interacción debe sentirse como seleccionar un objeto dentro de un videojuego arcade. La animación se ejecuta al pasar el mouse y también cuando la card recibe foco mediante teclado.

Secuencia:

1. La card se eleva `8px`.
2. La sombra aumenta su desplazamiento.
3. El objeto realiza un pequeño salto con una rotación mínima.
4. Los destellos aparecen rápidamente de forma escalonada.
5. El botón se vuelve ligeramente más intenso.
6. Al salir, la card vuelve a su posición sin rebotes prolongados.

La duración total debe mantenerse por debajo de `500ms`. No dejar animaciones infinitas cuando la card está en reposo.

```scss
.item-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 1rem;
  color: var(--item-ink);
  background: var(--item-card);
  border: var(--item-border);
  border-radius: 0;
  box-shadow: var(--item-shadow-rest);
  transition: transform 160ms ease, box-shadow 160ms ease;
  will-change: transform;
}

.item-card:hover,
.item-card:focus-within,
.item-card:focus-visible {
  transform: translateY(-8px);
  box-shadow: var(--item-shadow-hover);
}

.item-card:hover .item-card__image,
.item-card:focus-within .item-card__image,
.item-card:focus-visible .item-card__image {
  animation: item-jump 450ms ease;
}

.item-card__spark {
  position: absolute;
  z-index: 2;
  color: var(--item-pink);
  opacity: 0;
  transform: scale(0) rotate(-30deg);
  pointer-events: none;
}

.item-card__spark--1 {
  top: 13%;
  left: 10%;
}

.item-card__spark--2 {
  top: 16%;
  right: 11%;
  color: var(--item-cyan);
}

.item-card__spark--3 {
  right: 9%;
  bottom: 15%;
}

.item-card:hover .item-card__spark,
.item-card:focus-within .item-card__spark,
.item-card:focus-visible .item-card__spark {
  animation: item-spark-pop 350ms ease forwards;
}

.item-card:hover .item-card__spark--2,
.item-card:focus-within .item-card__spark--2,
.item-card:focus-visible .item-card__spark--2 {
  animation-delay: 70ms;
}

.item-card:hover .item-card__spark--3,
.item-card:focus-within .item-card__spark--3,
.item-card:focus-visible .item-card__spark--3 {
  animation-delay: 140ms;
}

@keyframes item-jump {
  0%   { transform: translateY(0) rotate(0); }
  40%  { transform: translateY(-7px) rotate(-3deg); }
  70%  { transform: translateY(2px) rotate(2deg); }
  100% { transform: translateY(0) rotate(0); }
}

@keyframes item-spark-pop {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-30deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.4) rotate(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .item-card,
  .item-card * {
    animation: none !important;
    transition: none !important;
  }
}
```

Para dispositivos sin hover, no depender de la animación para comunicar información. La compra, el precio y el estado deben permanecer visibles.

## Estados visuales

- `AVAILABLE`: botón amarillo activo y card con contraste completo.
- `INSUFFICIENT_FUNDS`: precio y mensaje en fucsia; botón deshabilitado con texto `SALDO INSUFICIENTE`.
- `SOLD_OUT`: capa rectangular fucsia con texto `AGOTADO`; no ocultar nombre ni efecto.
- `COMING_SOON`: badge cian `PRÓXIMAMENTE`; botón deshabilitado.
- Procesando compra: conservar el ancho del botón y mostrar `PROCESANDO...`; impedir doble clic.
- Compra exitosa: feedback corto y visible; no depender únicamente del color.

Los estados deshabilitados no deben usar una opacidad tan baja que vuelva ilegible la card.

## Prompt canónico para crear imágenes de nuevos ítems

Usar este molde cuando se genere el asset visual de otro producto:

```text
Crear una ilustración cuadrada del ítem "[NOMBRE]" para una colección de Mercado gamificada.

Mantener exactamente la identidad visual del ítem Escudo aprobado: pixel art moderno, arcade oscuro y neobrutalismo de bordes duros. Fondo o panel violeta intenso, marco fucsia, contorno negro grueso, luces planas en blanco/plata y pequeños acentos amarillos o cian. Objeto grande, centrado, reconocible y con silueta clara. Agregar de dos a cuatro destellos separados visualmente alrededor del objeto.

Sin texto, sin precio, sin botón y sin card completa. El resultado es únicamente el asset del objeto para colocarlo dentro del componente Angular. Sin gradientes suaves, sin blur, sin realismo 3D, sin fotografía, sin bordes redondeados, sin logos y sin marca de agua.
```

El objeto debe generarse sin textos porque el nombre, efecto, precio y CTA pertenecen al HTML. Esto permite mantener consistencia, accesibilidad y actualización dinámica.

## Control de calidad

Antes de aprobar un nuevo ítem, verificar:

- ¿Parece parte de la misma colección que el Escudo?
- ¿Mantiene la estructura, bordes, sombra y proporciones?
- ¿El objeto se reconoce rápidamente?
- ¿Nombre, efecto y precio se leen sin esfuerzo?
- ¿Los destellos son elementos independientes y se animan al hover/focus?
- ¿La card se eleva sin mover o romper la grilla?
- ¿La animación dura menos de medio segundo?
- ¿Funciona con teclado y respeta movimiento reducido?
- ¿Los contenidos largos no cambian la alineación del botón?
- ¿No se introdujeron estilos suaves, redondeados o ajenos al sistema?

Un ítem no está terminado si solamente se ve bien como imagen estática; debe conservar la misma calidad dentro del componente real y en todos sus estados.


NUEVOS ITEMS
{
  "catalogVersion": "1.0.0",
  "totalItems": 15,
  "generatedAt": "2026-09-13T23:12:30.053Z",
  "items": [
    {
      "itemCode": "SHIELD_T1",
      "name": "Escudo de Aprendiz",
      "tier": {
        "level": 1,
        "code": "COMMON",
        "label": "Común"
      },
      "category": "EQUIPMENT",
      "consumable": true,
      "price": 200,
      "verb": "ABSORB_FAILURE",
      "effectSummary": "Absorbe 1 fallo puntual de test o compilación sin perder vidas.",
      "description": "Protección fundamental de una sola carga. Diseñado para cubrir al alumno de un typo o un error puntual en su primera entrega.",
      "requirements": {
        "minStudentLevel": 1
      },
      "params": {
        "charges": 1,
        "appliesOn": "FINAL_FAILED_ATTEMPT",
        "scope": "SINGLE_CHALLENGE"
      }
    },
    {
      "itemCode": "SHIELD_T2",
      "name": "Escudo Reforzado",
      "tier": {
        "level": 2,
        "code": "UNCOMMON",
        "label": "Poco Común"
      },
      "category": "EQUIPMENT",
      "consumable": true,
      "price": 500,
      "verb": "ABSORB_FAILURE",
      "effectSummary": "Absorbe hasta 2 fallos sucesivos sin descontar vidas.",
      "description": "Forjado con doble núcleo de absorción. Permite cometer hasta dos equivocaciones en desafíos prácticos.",
      "requirements": {
        "minStudentLevel": 2
      },
      "params": {
        "charges": 2,
        "appliesOn": "FINAL_FAILED_ATTEMPT",
        "scope": "MULTI_CHALLENGE"
      }
    },
    {
      "itemCode": "SHIELD_T3",
      "name": "Escudo Baluarte TDD",
      "tier": {
        "level": 3,
        "code": "RARE",
        "label": "Raro"
      },
      "category": "EQUIPMENT",
      "consumable": true,
      "price": 1000,
      "verb": "ABSORB_FAILURE",
      "effectSummary": "Absorbe hasta 3 fallos consecutivos en iteraciones complejas.",
      "description": "Construido para metodologías Test-Driven Development: soporta hasta 3 fallas sucesivas mientras se itera el código verde.",
      "requirements": {
        "minStudentLevel": 3
      },
      "params": {
        "charges": 3,
        "appliesOn": "FINAL_FAILED_ATTEMPT",
        "scope": "MULTI_CHALLENGE"
      }
    },
    {
      "itemCode": "SHIELD_T4",
      "name": "Baluarte Titánico",
      "tier": {
        "level": 4,
        "code": "EPIC",
        "label": "Épico"
      },
      "category": "EQUIPMENT",
      "consumable": true,
      "price": 2000,
      "verb": "ABSORB_FAILURE",
      "effectSummary": "Barrera reforzada de 5 cargas para sprints y entregas integradoras.",
      "description": "Armadura pesada de 5 núcleos de absorción capaz de cubrir al estudiante durante todo un sprint de entregas complejas sin consumir vidas.",
      "requirements": {
        "minStudentLevel": 4
      },
      "params": {
        "charges": 5,
        "appliesOn": "FINAL_FAILED_ATTEMPT",
        "scope": "SPRINT"
      }
    },
    {
      "itemCode": "SHIELD_T5",
      "name": "Égida Imperial",
      "tier": {
        "level": 5,
        "code": "LEGENDARY",
        "label": "Legendario"
      },
      "category": "EQUIPMENT",
      "consumable": true,
      "price": 4000,
      "verb": "ABSORB_FAILURE",
      "effectSummary": "Blindaje definitivo de 8 cargas de absorción de errores evaluativos.",
      "description": "La máxima reliquia defensiva: absorbe hasta 8 fallos en exámenes parciales oficiales o retos boss sin penalización de vidas.",
      "requirements": {
        "minStudentLevel": 5
      },
      "params": {
        "charges": 8,
        "appliesOn": "FINAL_FAILED_ATTEMPT",
        "scope": "FULL_EXAM_OR_SPRINT"
      }
    },
    {
      "itemCode": "XP_BOOST_T1",
      "name": "Tónico de Concentración",
      "tier": {
        "level": 1,
        "code": "COMMON",
        "label": "Común"
      },
      "category": "BUFF",
      "consumable": true,
      "price": 200,
      "verb": "XP_MULTIPLIER",
      "effectSummary": "+25% de XP durante 1 hora en todos los ejercicios aprobados.",
      "description": "Brebaje pedagógico ligero que potencia la absorción de conceptos en sesiones cortas de práctica.",
      "requirements": {
        "minStudentLevel": 1
      },
      "params": {
        "factor": 1.25,
        "bonusPercentage": 25,
        "durationMinutes": 60,
        "stackable": false
      }
    },
    {
      "itemCode": "XP_BOOST_T2",
      "name": "Elixir de Sabiduría",
      "tier": {
        "level": 2,
        "code": "UNCOMMON",
        "label": "Poco Común"
      },
      "category": "BUFF",
      "consumable": true,
      "price": 500,
      "verb": "XP_MULTIPLIER",
      "effectSummary": "+50% de XP durante 2 horas en actividades formativas.",
      "description": "Otorga un impulso sustancial de experiencia para avanzar rápidamente a través de guías y ejercicios del módulo.",
      "requirements": {
        "minStudentLevel": 2
      },
      "params": {
        "factor": 1.5,
        "bonusPercentage": 50,
        "durationMinutes": 120,
        "stackable": false
      }
    },
    {
      "itemCode": "XP_BOOST_T3",
      "name": "Elixir de Hiperexperiencia",
      "tier": {
        "level": 3,
        "code": "RARE",
        "label": "Raro"
      },
      "category": "BUFF",
      "consumable": true,
      "price": 1000,
      "verb": "XP_MULTIPLIER",
      "effectSummary": "Duplica la ganancia de XP (x2.0) durante 4 horas continuas.",
      "description": "Poción de alquimia académica que duplica todos los puntos de experiencia obtenidos. Ideal para sesiones intensivas de estudio.",
      "requirements": {
        "minStudentLevel": 3
      },
      "params": {
        "factor": 2,
        "bonusPercentage": 100,
        "durationMinutes": 240,
        "stackable": false
      }
    },
    {
      "itemCode": "XP_BOOST_T4",
      "name": "Tomo del Doble Titán",
      "tier": {
        "level": 4,
        "code": "EPIC",
        "label": "Épico"
      },
      "category": "BUFF",
      "consumable": true,
      "price": 2000,
      "verb": "XP_MULTIPLIER",
      "effectSummary": "Multiplicador x2.5 (+150% de XP) activo durante 8 horas.",
      "description": "Artefacto de progresión acelerada para ascender en el ranking de la cohorte durante jornadas completas de laboratorio.",
      "requirements": {
        "minStudentLevel": 4
      },
      "params": {
        "factor": 2.5,
        "bonusPercentage": 150,
        "durationMinutes": 480,
        "stackable": false
      }
    },
    {
      "itemCode": "XP_BOOST_T5",
      "name": "Corona de Omnisciencia",
      "tier": {
        "level": 5,
        "code": "LEGENDARY",
        "label": "Legendario"
      },
      "category": "BUFF",
      "consumable": true,
      "price": 4000,
      "verb": "XP_MULTIPLIER",
      "effectSummary": "Triplica la experiencia (x3.0) durante 24 horas continuas.",
      "description": "La máxima bendición de conocimiento. Triplica todo el XP cosechado en desafíos, quizzes y entregas durante un día entero.",
      "requirements": {
        "minStudentLevel": 5
      },
      "params": {
        "factor": 3,
        "bonusPercentage": 200,
        "durationMinutes": 1440,
        "stackable": false
      }
    },
    {
      "itemCode": "COIN_BOOST_T1",
      "name": "Amuleto de Cobre",
      "tier": {
        "level": 1,
        "code": "COMMON",
        "label": "Común"
      },
      "category": "BUFF",
      "consumable": true,
      "price": 200,
      "verb": "COIN_MULTIPLIER",
      "effectSummary": "+25% de monedas en tus próximas 3 entregas aprobadas.",
      "description": "Talismán financiero introductorio emitido por el Banco que otorga una bonificación de ahorro en las primeras victorias.",
      "requirements": {
        "minStudentLevel": 1
      },
      "params": {
        "factor": 1.25,
        "bonusPercentage": 25,
        "maxApprovedChallenges": 3,
        "expiresOnFailure": false
      }
    },
    {
      "itemCode": "COIN_BOOST_T2",
      "name": "Imán de Monedas",
      "tier": {
        "level": 2,
        "code": "UNCOMMON",
        "label": "Poco Común"
      },
      "category": "BUFF",
      "consumable": true,
      "price": 500,
      "verb": "COIN_MULTIPLIER",
      "effectSummary": "+50% de monedas en tus próximas 5 entregas aprobadas.",
      "description": "Dispositivo magnético que incrementa en un 50% el circulante cobrado en cada resolución exitosa de desafíos.",
      "requirements": {
        "minStudentLevel": 2
      },
      "params": {
        "factor": 1.5,
        "bonusPercentage": 50,
        "maxApprovedChallenges": 5,
        "expiresOnFailure": false
      }
    },
    {
      "itemCode": "COIN_BOOST_T3",
      "name": "Talismán del Tesoro",
      "tier": {
        "level": 3,
        "code": "RARE",
        "label": "Raro"
      },
      "category": "BUFF",
      "consumable": true,
      "price": 1000,
      "verb": "COIN_MULTIPLIER",
      "effectSummary": "Duplica las monedas (x2.0) en tus próximas 8 entregas aprobadas.",
      "description": "Reliquia bancaria de alto rendimiento que duplica los pagos directos acreditados por el Banco en cuenta corriente.",
      "requirements": {
        "minStudentLevel": 3
      },
      "params": {
        "factor": 2,
        "bonusPercentage": 100,
        "maxApprovedChallenges": 8,
        "expiresOnFailure": false
      }
    },
    {
      "itemCode": "COIN_BOOST_T4",
      "name": "Cofre de la Abundancia",
      "tier": {
        "level": 4,
        "code": "EPIC",
        "label": "Épico"
      },
      "category": "BUFF",
      "consumable": true,
      "price": 2000,
      "verb": "COIN_MULTIPLIER",
      "effectSummary": "Multiplicador x2.5 de monedas en tus próximas 12 entregas aprobadas.",
      "description": "Contrato fiduciario para estudiantes avanzados que garantiza un retorno financiero extraordinario en 12 entregas exitosas.",
      "requirements": {
        "minStudentLevel": 4
      },
      "params": {
        "factor": 2.5,
        "bonusPercentage": 150,
        "maxApprovedChallenges": 12,
        "expiresOnFailure": false
      }
    },
    {
      "itemCode": "COIN_BOOST_T5",
      "name": "Toque Dorado de Midas",
      "tier": {
        "level": 5,
        "code": "LEGENDARY",
        "label": "Legendario"
      },
      "category": "BUFF",
      "consumable": true,
      "price": 4000,
      "verb": "COIN_MULTIPLIER",
      "effectSummary": "Triplica las monedas (x3.0) en tus próximas 20 entregas aprobadas.",
      "description": "El multiplicador de riqueza supremo del Mercado: triplica la recompensa de 20 entregas aprobadas, asegurando liquidez para todo el cuatrimestre.",
      "requirements": {
        "minStudentLevel": 5
      },
      "params": {
        "factor": 3,
        "bonusPercentage": 200,
        "maxApprovedChallenges": 20,
        "expiresOnFailure": false
      }
    }
  ]
}
MODAL DE ITEMS 
## Modal de detalle

Al hacer clic o tocar una card, abrir un modal centrado con:

- PNG transparente del objeto.en lo
- Nombre del producto.
- Descripción completa y efecto.
- Precio con ícono de moneda.
- Botón “COMPRAR”.
- Botón visible para cerrar.

En desktop, usar dos columnas: imagen a la izquierda e información a la derecha. Mantener el estilo arcade neobrutalista, con bordes de 2–3px, sombra dura moderada y suficiente espacio negativo.

El fondo debe oscurecerse con un overlay. Bloquear el scroll mientras el modal esté abierto.

Animación de entrada breve: aparecer y elevarse suavemente durante 200–250ms. Sin animaciones infinitas.

Debe poder cerrarse mediante:

- Botón X.
- Tecla Escape.
- Clic fuera del modal.

Usar el mismo PNG de `assets/items/`, sin recrearlo con CSS. El contenido debe obtenerse del item seleccionado, sin duplicar un modal por producto.


# Animaciones de los items del Mercado

## Objetivo

Los 15 productos del catálogo pertenecen a cuatro familias. Todas las cards conservan la misma estructura visual y el mismo componente Angular, pero muestran una animación diferente según su familia.

Las familias disponibles son:

- `SHIELD`
- `EXPERIENCE`
- `COINS`
- `LIFE`

Esta sección reemplaza completamente la animación anterior de tres destellos genéricos. No mostrar esos destellos junto con las nuevas animaciones.

## Modelo de datos

Cada producto debe declarar obligatoriamente su familia:

```ts
export type ItemFamily =
  | 'SHIELD'
  | 'EXPERIENCE'
  | 'COINS'
  | 'LIFE';

export interface MarketItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  family: ItemFamily;
}
```

Los 15 productos deben utilizar una de estas cuatro familias.

No crear una lógica distinta para cada producto. La animación debe elegirse únicamente mediante `item.family`.

## Estructura Angular

Usar un único componente reutilizable para todas las cards.

Aplicar la familia mediante un atributo:

```html
<article
  class="market-item"
  [attr.data-family]="item.family"
  tabindex="0"
>
  <div class="market-item__visual">
    <div
      class="market-item__effects"
      aria-hidden="true"
    >
      <!-- Elementos decorativos según la familia -->
    </div>

    <img
      class="market-item__image"
      [src]="item.image"
      [alt]="item.name"
    />
  </div>

  <!-- Información del producto -->
</article>
```

La imagen principal debe seguir renderizándose con:

```css
.market-item__image {
  object-fit: contain;
}
```

No modificar el PNG principal para incluir la animación. Todos los efectos deben estar separados de la imagen del producto.

Los elementos decorativos deben incluir:

```css
pointer-events: none;
```

## Activación

La animación correspondiente debe ejecutarse cuando:

- El usuario pasa el mouse sobre la card.
- La card recibe foco mediante teclado usando `:focus-visible`.

No ejecutar animaciones:

- Al cargar la página.
- Permanentemente.
- Mientras el usuario no interactúe.
- En ciclos infinitos.

La animación debe ejecutarse una sola vez cuando comienza el hover. Para repetirla, el usuario debe retirar el mouse y volver a ingresar.

## Animación general de la card

Todas las familias conservan el mismo movimiento general:

1. La card se eleva `6px`.
2. La sombra cambia de `4px 5px 0` a `7px 9px 0`.
3. El objeto principal realiza un salto corto.
4. Se ejecuta simultáneamente la animación especial de su familia.

La card no debe escalar más de `1.01`.

Usar aproximadamente:

```css
.market-item:hover,
.market-item:focus-visible {
  transform: translateY(-6px);
  box-shadow: 7px 9px 0 #000;
}
```

El salto del objeto debe ser corto y delicado:

```text
Posición inicial → subir 7px → bajar 2px → posición inicial
```

Duración orientativa: `350ms`.

No mover, redimensionar ni desplazar las cards vecinas.

## Familia SHIELD

### Resultado esperado

Al pasar el mouse sobre un producto de la familia `SHIELD`:

1. El escudo principal realiza el salto general.
2. Desde detrás del escudo principal aparece un escudo pequeño.
3. El escudo pequeño sale hacia arriba y hacia la izquierda.
4. Simultáneamente, una espada sale desde detrás del escudo.
5. La espada se desplaza diagonalmente hacia arriba y hacia la derecha.
6. Ambos elementos pierden opacidad y desaparecen antes de terminar.

La sensación debe ser de defensa y combate activándose rápidamente.

### Movimiento del escudo pequeño

```text
Inicio:
- Detrás del objeto principal.
- Opacidad 0.
- Escala 0.65.

Punto máximo:
- Desplazamiento aproximado: X -34px / Y -30px.
- Rotación aproximada: -8deg.
- Opacidad 1.
- Escala 1.

Final:
- Desplazamiento aproximado: X -42px / Y -38px.
- Opacidad 0.
- Escala 0.85.
```

### Movimiento de la espada

```text
Inicio:
- Detrás del escudo principal.
- Opacidad 0.
- Escala 0.6.

Punto máximo:
- Desplazamiento aproximado: X 32px / Y -36px.
- Rotación aproximada: -35deg.
- Opacidad 1.
- Escala 1.

Final:
- Desplazamiento aproximado: X 42px / Y -46px.
- Opacidad 0.
- Escala 0.9.
```

Duración total: `420ms`.

Usar exclusivamente estos assets transparentes:

```text
assets/items/effects/mini-shield.png
assets/items/effects/sword.png
```

No dibujar la espada ni el escudo mediante:

- CSS.
- Emojis.
- Caracteres tipográficos.
- Figuras geométricas.
- Íconos de otra librería.

Si alguno de los assets no existe, informarlo. No reemplazarlo automáticamente por una figura CSS.

## Familia EXPERIENCE

### Resultado esperado

Al pasar el mouse sobre un producto de la familia `EXPERIENCE`:

1. El orbe realiza el salto general.
2. El núcleo blanco/lila aumenta brevemente su luminosidad.
3. Desde el interior del orbe aparecen tres auroras violetas.
4. Las auroras ascienden desde el núcleo.
5. Mientras suben, se separan ligeramente.
6. Pierden opacidad y desaparecen antes de finalizar.

La animación debe transmitir energía mágica y progreso, sin parecer humo ni fuego.

### Auroras

Crear tres capas decorativas independientes:

- Aurora izquierda: violeta oscuro.
- Aurora central: violeta brillante.
- Aurora derecha: lila claro.

Movimiento orientativo:

```text
Inicio:
- Nacen en el centro del orbe.
- Opacidad 0.
- Escala vertical 0.25.

Punto máximo:
- Suben entre 25px y 40px.
- Opacidad entre 0.75 y 1.
- Escala vertical 1.

Final:
- Suben entre 40px y 55px.
- Se separan horizontalmente.
- Opacidad 0.
```

Aplicar retrasos escalonados:

```text
Aurora izquierda: 0ms
Aurora central: 45ms
Aurora derecha: 90ms
```

Duración total máxima: `450ms`.

Las auroras pueden construirse con elementos CSS porque son efectos de energía abstractos, pero deben:

- Ser elementos separados.
- Estar detrás del PNG del orbe.
- No agregar un fondo rectangular.
- No alterar el archivo original.
- Mantener bordes visualmente limpios.
- Evitar un blur excesivo.

No agregar destellos genéricos adicionales.

## Familia COINS

### Resultado esperado

Al pasar el mouse sobre un producto de la familia `COINS`:

1. El objeto principal realiza el salto general.
2. Cuatro monedas pequeñas aparecen desde detrás del objeto.
3. Cada moneda sigue un arco corto diferente.
4. Las monedas giran ligeramente mientras ascienden.
5. Aparecen de manera escalonada.
6. Pierden opacidad antes de finalizar.

La sensación debe ser la de una pequeña recompensa obtenida.

### Trayectorias orientativas

```text
Moneda 1:
- X -38px
- Y -38px
- Rotación -80deg
- Delay 0ms

Moneda 2:
- X -14px
- Y -55px
- Rotación 100deg
- Delay 35ms

Moneda 3:
- X 16px
- Y -52px
- Rotación -100deg
- Delay 70ms

Moneda 4:
- X 40px
- Y -35px
- Rotación 80deg
- Delay 105ms
```

Cada moneda debe comenzar:

```text
- Detrás del objeto principal.
- Opacidad 0.
- Escala 0.55.
```

En el punto máximo debe alcanzar:

```text
- Opacidad 1.
- Escala entre 0.85 y 1.
```

Al finalizar:

```text
- Opacidad 0.
- Escala 0.75.
```

Duración total: `420ms`.

Usar exclusivamente:

```text
assets/items/effects/coin-mini.png
```

Reutilizar el mismo PNG para las cuatro partículas.

No representar las monedas mediante:

- Emojis.
- Texto.
- Círculos CSS.
- Caracteres.
- Íconos externos.

## Familia LIFE

### Resultado esperado

Al pasar el mouse sobre un producto de la familia `LIFE`:

1. El corazón principal realiza el salto general.
2. Aparecen cuatro corazones pequeños.
3. Dos salen por el lado izquierdo.
4. Dos salen por el lado derecho.
5. Los corazones ascienden mientras se alejan del objeto.
6. Aparecen de forma escalonada.
7. Pierden opacidad y desaparecen.

La animación debe sentirse alegre y liviana, sin llenar toda la card.

### Trayectorias orientativas

```text
Corazón izquierdo 1:
- X -32px
- Y -28px
- Rotación -12deg
- Delay 0ms

Corazón derecho 1:
- X 32px
- Y -30px
- Rotación 12deg
- Delay 40ms

Corazón izquierdo 2:
- X -44px
- Y -48px
- Rotación -18deg
- Delay 80ms

Corazón derecho 2:
- X 44px
- Y -46px
- Rotación 18deg
- Delay 120ms
```

Cada corazón debe comenzar:

```text
- Cerca de los laterales del objeto principal.
- Opacidad 0.
- Escala 0.5.
```

En el punto máximo:

```text
- Opacidad 1.
- Escala entre 0.8 y 1.
```

Al finalizar:

```text
- Opacidad 0.
- Escala 0.7.
```

Duración total: `420ms`.

Usar exclusivamente:

```text
assets/items/effects/heart-mini.png
```

Reutilizar el mismo PNG para los cuatro corazones.

No representar los corazones mediante CSS, emojis ni caracteres.

## Capas visuales

Mantener este orden:

```text
1. Fondo del panel visual.
2. Efectos animados.
3. Imagen PNG principal.
4. Elementos de interfaz que deban quedar por encima.
```

Los efectos deben nacer visualmente detrás del objeto principal.

Usar `position: absolute` para los efectos y `position: relative` para el panel visual.

No permitir que las partículas cambien el tamaño del contenedor.

## Rendimiento

Animar principalmente:

- `transform`.
- `opacity`.

No animar continuamente:

- `width`.
- `height`.
- `margin`.
- `padding`.
- Propiedades que recalculen la grilla.

No usar JavaScript para modificar posiciones cuadro por cuadro.

Las animaciones deben implementarse mediante CSS y clases determinadas por `item.family`.

## Accesibilidad

Agregar soporte para:

```css
@media (prefers-reduced-motion: reduce) {
  /* Desactivar desplazamientos y dejar solamente un cambio breve de opacidad */
}
```

La decoración debe incluir:

```html
aria-hidden="true"
```

La interacción mediante teclado debe utilizar `:focus-visible`.

No eliminar el indicador de foco sin proporcionar un reemplazo visible.

## Comportamiento en dispositivos táctiles

No depender del hover para acceder a información o comprar.

En dispositivos sin hover:

- No ejecutar las partículas automáticamente.
- Permitir abrir el modal tocando la card o su botón.
- Mantener toda la información y funcionalidad disponible.

## Modal

Las nuevas animaciones no deben modificar el funcionamiento del modal.

Al hacer clic en una card:

- Abrir el modal del item seleccionado.
- Mostrar su imagen, nombre, descripción, precio y botón de compra.
- No volver a reproducir partículas dentro del modal, salvo que se solicite posteriormente.

## Validación obligatoria

Antes de finalizar:

1. Ejecutar la aplicación Angular.
2. Abrir Mercado en un viewport de `1440×900`.
3. Usar `$playwright-interactive`.
4. Probar al menos una card de cada familia.
5. Capturar cada estado de hover.
6. Compararlo con el estilo visual aprobado.
7. Confirmar que ninguna card vecina se mueve.
8. Confirmar que las partículas no quedan visibles.
9. Confirmar que ninguna animación es infinita.
10. Confirmar que la animación vuelve a ejecutarse después de retirar y volver a ingresar el mouse.
11. Confirmar que el modal sigue abriéndose correctamente.
12. Confirmar que los assets provienen de `assets/items/`.