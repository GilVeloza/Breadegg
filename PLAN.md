# BreadEgg — Plan de la web

## Contexto

BreadEgg es un **AI Product Studio** con base en Madeira: IA + software + diseño bajo una sola marca.
La web no es un catálogo de servicios ni un tarifario — es la **declaración de esencia** del estudio y
la herramienta que convierte a un desconocido en una conversación.

Decisiones ya tomadas:

- **Sin sección de precios / planes.** Explícitamente fuera de alcance.
- **La esencia manda.** El manifiesto y el tono pesan más que la lista de features.
- **El huevo es el protagonista**, no un adorno del hero.
- **Tipografía tipo iOS.** Sistema tipográfico al estilo de San Francisco (ver §3.1).
- **Cuatro idiomas:** inglés (por defecto), portugués, español, alemán.
- **Casos reales** en la sección de trabajos, con métricas.
- **Contacto triple:** formulario propio + Cal.com + email visible.

Estado actual: `/Users/gilveloza/Breadegg-web` está vacío. Se construye desde cero.
(`~/Breadegg` es un scaffold de Lovable con página de precios — **no se reutiliza**.)

---

## Estado

| Milestone | Estado |
|---|---|
| M1 · Cimientos | ✅ Next 16, Tailwind v4, tokens, Inter Variable, 4 idiomas, Lenis, nav, footer |
| M2 · El huevo WebGL | ✅ Shader de yema, respiración, parallax, crossfade sobre el huevo CSS |
| M3 · La historia | ✅ Manifiesto, productos, capacidades, proceso, sectores, Madeira, casos, contacto |
| M4 · La grieta | ❌ Descartada — se probó y quedaba fea. Sustituida por el halo (ver §1) |
| M5 · Pulido | 🟨 OG por idioma, sitemap, robots, JSON-LD, hreflang hechos. Falta Lighthouse y deploy. |

Pendiente de contenido tuyo: los casos reales (`content/cases.ts`) y las variables de
entorno (`.env.local`).

---

## 1. La idea central: el círculo, intacto

**El círculo nunca se deforma.** Es la marca; deformarla la destruye.

Se probó abrirlo en dos mitades por una costura dentada. Quedaba mal: al separarse, el interior
iluminado llenaba el canvas entero y el huevo se leía como un cuadrado de luz. Descartado.

Lo que hace el huevo es exactamente esto:

```
reposo    flota despacio, subiendo y bajando (ciclo de 9s)
          + el brillo sigue al cursor (solo en WebGL)

scroll    sube algo más rápido que la página
          + un halo cálido va apareciendo a su alrededor
```

Toda la personalidad la carga el material — el gradiente de la yema, el borde cálido, la luz
interna — nunca la silueta. La contención es la propuesta: en una web de estudio de IA, el objeto
que no hace trucos es el que parece caro.

---

## 2. Identidad visual (extraída de tus assets)

De `breadegg.jpg` / `breadegg_curve.png`:

| Token | Valor | Uso |
|---|---|---|
| `--crust` | `#2A1A0F` | Fondo. Marrón de corteza tostada. |
| `--crumb` | `#F7F1E8` | Texto principal, blanco cálido de miga. |
| `--yolk` | `#F4901C` | Naranja de marca. |
| `--yolk-hi` | `#FFEDAE` | Brillo interno de la yema. |
| `--yolk-deep`| `#E0690A` | Borde / sombra del huevo. |
| `--ash` | `#A89685` | Texto secundario. |

Regla de color: **el naranja casi nunca se usa como relleno de UI**. Es luz. Aparece en el huevo,
en un subrayado, en un foco. Todo lo demás es marrón y crema. Así el huevo siempre gana la mirada.

**Cuidado técnico:** un gradiente naranja a pantalla completa hace *banding* visible.
El shader lleva dithering. No es opcional.

---

## 3. Stack

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Next.js 15** (App Router) | SEO real, OG images, metadata. La web debe aparecer en búsquedas de Funchal/Lisboa. |
| Estilos | **Tailwind v4** (`@theme` en CSS) | Tokens de marca como CSS vars nativas. |
| 3D | **react-three-fiber + drei** | El huevo. |
| Scroll | **Lenis** + **GSAP ScrollTrigger** | Lenis da la inercia; ScrollTrigger da el *pin* y el *scrub* preciso. |
| Micro | **Motion** (framer-motion) | Hover, entradas, magnético. |
| i18n | **next-intl** | Cuatro idiomas con rutas `/[locale]`, nativo de App Router. |
| Formulario | **Resend** + route handler | El envío llega a tu correo. |
| Agenda | **Cal.com** (embed) | Reserva de llamada sin salir de la web. |
| Deploy | **Vercel** | Preview por rama. |

Node 20.19.5 local — compatible.

El formulario obliga a un route handler, así que **no usamos `output: 'export'`**: Next corre en
Vercel con una función para `/api/contact`. Todo lo demás sigue siendo estático.

### 3.1 Tipografía — el sistema iOS

La SF Pro de Apple no se puede licenciar para una web. El equivalente fiel y libre es
**Inter Variable**, que incluye el eje óptico `opsz` — exactamente la distinción Display/Text que
hace que SF se vea bien tanto a 96px como a 14px. Se autoaloja, sin llamadas externas.

Pero el "sabor iOS" no está solo en la letra; está en cómo se usa:

| Regla | Valor |
|---|---|
| Titulares | 600 (semibold), **nunca** 700+. Apple no usa bold en display. |
| Tracking en display | `-0.03em` a `-0.045em`. El apretado óptico es la firma de SF. |
| Tracking en cuerpo | `0` — y ligeramente **positivo** en texto pequeño. |
| Interlineado | 1.05–1.1 en titulares, 1.6 en cuerpo. |
| Jerarquía | Por tamaño y peso, jamás por color o mayúsculas. |
| Numerales | Tabulares en métricas de casos de estudio. |

Y hay un beneficio de posicionamiento: una tipografía de *producto* sobre una paleta cálida hace
que BreadEgg se lea como un **estudio de producto**, no como una agencia. Refuerza justo lo que vendes.

*(Alternativa de un solo token si algún día la quieres: Geist Sans, algo más racionalista.)*

### 3.2 Los cuatro idiomas

Rutas: `/` (en, por defecto) · `/pt` · `/es` · `/de`. Con `hreflang` recíproco y `og:locale`.

Dos consecuencias de diseño que hay que respetar desde el primer componente:

- **El alemán ocupa ~30% más.** Ningún titular puede depender de un salto de línea concreto,
  ni ningún botón de un ancho fijo. Se prueba en alemán *antes* de dar una sección por terminada.
- **La copia no vive en los componentes.** Va en `messages/{en,pt,es,de}.json`. Cambiar un texto
  no toca código.

El manifiesto es el punto delicado: es la sección con más voz, y una traducción literal la mata.
Se traduce buscando el equivalente con fuerza, no la equivalencia palabra a palabra.

---

## 4. El huevo, técnicamente

**Geometría.** Esfera de alta resolución deformada en el vertex shader (`y' = y·(1 + k·y)`) → el
perfil clásico de huevo, suave y barato. Nada de modelos externos.

**Material.** `ShaderMaterial` propio que reproduce tu logo:

- gradiente radial desde `--yolk-hi` (arriba-izquierda) hacia `--yolk-deep` en el borde
- falso subsurface: `pow(1 - dot(N,V), 3)` → el borde caliente
- fBm muy sutil animado → la superficie "vive" sin dejar de ser lisa
- dither final contra el banding

**Rendimiento — el truco importante.** El hero pinta primero un **huevo en CSS puro**
(`radial-gradient`, indistinguible de tu PNG). Eso es el elemento LCP: aparece instantáneo.
El canvas WebGL se monta después y hace *crossfade* encima. El usuario nunca ve un hueco.

**Degradación:**

- `prefers-reduced-motion` → huevo CSS estático, sin Lenis, sin scrub. Sigue siendo bonito.
- móvil / GPU débil / sin WebGL → huevo CSS + parallax simple.
- sin JS → hero estático completo.

---

## 5. Secciones

| # | Sección | Qué hace |
|---|---|---|
| 00 | **Nav** | Mínima. El fondo se difumina al pasar el hero. La marca aparece cuando el huevo se va. |
| 01 | **Hero** | El huevo a pantalla completa. `We turn ideas into intelligent products.` · AI · Software · Design · Madeira, Portugal. |
| 02 | **Manifiesto** | *La sección más importante.* Tipografía cinética, línea a línea con el scroll: "You don't need another website. You need a better business." Luego el argumento: las empresas compran piezas sueltas — marca aquí, web allá, software por otro lado, y una IA que nadie usa. Nosotros construimos la cosa entera, porque la cosa entera es el punto. |
| 03 | **La grieta → 3 productos** | El huevo se abre. Salen: **01 Automation** (quitamos el trabajo repetitivo caro) · **02 Intelligence** (tus datos → predicciones y decisiones) · **03 Product** (marca, interfaz, software e IA construidos como una sola cosa). |
| 04 | **Capacidades** | Marquee/rejilla densa: ML, forecasting, RAG, agentes, visión, dashboards, APIs, SaaS, mobile, design systems, naming, identidad, UX. Demuestra alcance sin convertirse en un menú de 30 servicios. |
| 05 | **Cómo trabajamos** | Línea que se dibuja con el scroll: Listen → Map → Prototype → Build → Evolve. Con la promesa honesta: primer valor en semanas, no trimestres. |
| 06 | **Dónde** | Sectores con ejemplo concreto, no abstracciones: hotelería (predecir ocupación y ajustar precio), inmobiliaria, restauración, construcción, PYME. |
| 07 | **Madeira** | El momento tranquilo. Contorno topográfico animado de la isla. "Built on an island in the Atlantic. Working wherever the problem is." Isla → continente → Europa. |
| 08 | **Casos** | Trabajos reales con **el resultado como titular**, no el entregable. "Redujimos un 60% el tiempo de proceso de leads", no "hicimos una web". Numerales tabulares, cifra grande, contexto corto. Cada caso es una entrada tipada en `content/cases/`. |
| 09 | **Contacto** | El huevo vuelve, pequeño e incandescente. "Bring us a problem." Formulario + reserva en Cal.com + email visible + Funchal. |
| 10 | **Footer** | Marca, enlaces, año. |

Toda la copia vive en **`messages/{en,pt,es,de}.json`**. Editas texto sin tocar componentes.

---

## 6. Estructura de archivos

```
Breadegg-web/
├─ app/
│  ├─ [locale]/
│  │  ├─ layout.tsx         metadata + hreflang, fuentes, JSON-LD ProfessionalService (Funchal)
│  │  ├─ page.tsx           compone las secciones
│  │  └─ opengraph-image.tsx  OG generada con el huevo, por idioma
│  ├─ api/contact/route.ts  envío del formulario vía Resend (+ honeypot y rate limit)
│  └─ globals.css           Tailwind v4 @theme → tokens de marca + escala tipográfica iOS
├─ components/
│  ├─ egg/
│  │  ├─ EggCanvas.tsx      canvas R3F, montaje diferido
│  │  ├─ Egg.tsx            geometría + material
│  │  ├─ egg.frag.glsl      el shader de la yema
│  │  ├─ CssEgg.tsx         huevo CSS — elemento LCP y fallback
│  │  └─ useEggTimeline.ts  scroll global → estado del huevo
│  ├─ sections/             Hero, Manifesto, Products, Capabilities, Process, Sectors, Madeira, Cases, Contact
│  ├─ ui/                   RevealText, Marquee, Magnetic, ScrollCue, Field
│  ├─ Nav.tsx  Footer.tsx  LocaleSwitcher.tsx
├─ lib/                     lenis.ts, gsap.ts, motion-presets.ts
├─ content/cases/           un archivo tipado por caso de estudio
├─ messages/                en.json · pt.json · es.json · de.json  ← TODA la copia
├─ i18n/                    routing y config de next-intl
└─ public/fonts/            Inter Variable, autoalojada
```

Variables de entorno (`.env.local`, nunca en git): `RESEND_API_KEY`, `CONTACT_TO_EMAIL`,
`NEXT_PUBLIC_CAL_LINK`.

---

## 7. Milestones

Cada uno deja la web desplegable. No hay estado roto intermedio.

- **M1 · Cimientos** — Next + Tailwind + tokens + Inter Variable + escala tipográfica iOS + next-intl (4 idiomas) + Lenis + nav/footer + hero con huevo CSS. *Ya se ve la marca.*
- **M2 · El huevo** — R3F, shader de yema idéntico al logo, respiración, parallax de ratón, crossfade desde el CSS.
- **M3 · La historia** — todas las secciones con su coreografía de scroll, casos de estudio y contacto (formulario + Cal.com).
- **M4 · La grieta** — la secuencia de apertura. El momento épico.
- **M5 · Pulido** — perf (LCP < 2s), accesibilidad, contraste, SEO, hreflang, OG, reduced-motion, móvil, deploy.

Si M4 se complica, M1–M3 + M5 ya son una web excelente. La grieta es aditiva, no un bloqueo.

**Contenido que necesito de ti** (bloquea M3, no antes): para cada caso real — sector, problema de
partida, qué construimos, **la métrica del resultado**, y si el cliente se puede nombrar o va como
"una cadena hotelera en Funchal". Con dos o tres basta; más no mejora.

---

## 8. Verificación

- `npm run dev` → recorrer el scroll completo en Chrome y Safari, desktop y móvil.
- DevTools → *Rendering* → activar `prefers-reduced-motion` y confirmar que la página sigue entera y legible.
- DevTools → 4× CPU throttle + Fast 3G → comprobar que el huevo CSS pinta antes que el WebGL.
- Lighthouse: objetivo ≥ 95 en Performance / Accessibility / SEO.
- Contraste de todo el texto contra `--crust` en verificador WCAG AA.
- **Recorrer la web entera en alemán** buscando desbordes y titulares rotos.
- Enviar el formulario de verdad y confirmar que llega el correo; abrir el embed de Cal.com.
- `npm run build` limpio antes de cada deploy.
