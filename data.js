const WEEKS = [
  {
    num: 1,
    title: 'Existir con claridad',
    goal: 'Meta: +50 seguidores · Establecer hábito de publicación',
    days: [
      { label: 'Lunes', tasks: [
        { text: 'Carrusel de presentación: quién sos, para quién trabajás, qué ofrecés', tag: 'carrusel' },
        { text: 'Publicar con CTA: "Seguime si querés ver cómo lo hacemos"', tag: 'carrusel' },
        { text: '15 min interacción: comentar en 3 cuentas de clubes o restaurantes de Rosario', tag: 'interaccion' }
      ]},
      { label: 'Martes', tasks: [
        { text: 'Historia: encuesta "¿Tu negocio tiene presencia en redes?" Sí / No', tag: 'historia' },
        { text: '15 min interacción: responder comentarios y DMs', tag: 'interaccion' }
      ]},
      { label: 'Miércoles', tasks: [
        { text: 'Reel: proceso de edición grabando la pantalla + voz en off explicando', tag: 'reel' },
        { text: 'CTA del reel: "¿Querés esto para tu marca? Escribime"', tag: 'reel' },
        { text: '15 min interacción: comentar en 3 cuentas nuevas de tu nicho', tag: 'interaccion' }
      ]},
      { label: 'Jueves', tasks: [
        { text: 'Carrusel educativo: "3 errores que cometen los restaurantes en sus redes"', tag: 'carrusel' },
        { text: 'CTA: "Guardalo para no olvidarlo"', tag: 'carrusel' },
        { text: '15 min interacción estratégica', tag: 'interaccion' }
      ]},
      { label: 'Viernes', tasks: [
        { text: 'Reel behind the scenes: mostrá tu setup DJI Pocket 3 + iPhone 13 Pro', tag: 'reel' },
        { text: 'CTA: "¿Con qué grabás vos?" para generar comentarios', tag: 'reel' },
        { text: '15 min interacción + responder todos los comentarios', tag: 'interaccion' }
      ]},
      { label: 'Sábado', tasks: [
        { text: 'Historia: 3-4 stories contando qué hiciste durante la semana', tag: 'historia' },
        { text: '15 min responder mensajes pendientes', tag: 'interaccion' }
      ]},
      { label: 'Domingo', tasks: [
        { text: 'Planificar contenido de la semana 2', tag: 'interaccion' }
      ]}
    ]
  },
  {
    num: 2,
    title: 'Mostrar autoridad',
    goal: 'Meta: +80 seguidores · Posicionarte como referente en tu nicho',
    days: [
      { label: 'Lunes', tasks: [
        { text: 'Reel educativo: "Por qué el video vertical convierte más que una foto"', tag: 'reel' },
        { text: 'CTA: "¿Ya usás video en tu negocio?"', tag: 'reel' },
        { text: '15 min interacción en cuentas del nicho', tag: 'interaccion' }
      ]},
      { label: 'Martes', tasks: [
        { text: 'Historia con caja de preguntas: "¿Qué tipo de contenido le funciona mejor a tu negocio?"', tag: 'historia' },
        { text: 'Guardar respuestas como ideas de contenido futuro', tag: 'interaccion' }
      ]},
      { label: 'Miércoles', tasks: [
        { text: 'Reel caso real: mostrá un trabajo con cliente (con permiso)', tag: 'reel' },
        { text: 'CTA: "Si querés algo así para tu marca, link en bio"', tag: 'reel' },
        { text: '15 min interacción: responder historias de potenciales clientes con valor', tag: 'interaccion' }
      ]},
      { label: 'Jueves', tasks: [
        { text: 'Carrusel: "Así planifico el contenido de un restaurante en 1 hora"', tag: 'carrusel' },
        { text: '15 min interacción estratégica', tag: 'interaccion' }
      ]},
      { label: 'Viernes', tasks: [
        { text: 'Reel de opinión: "El contenido bonito que no vende no sirve de nada"', tag: 'reel' },
        { text: 'CTA: "¿Estás de acuerdo? Comentá"', tag: 'reel' },
        { text: '15 min interacción + responder debate generado', tag: 'interaccion' }
      ]},
      { label: 'Sábado', tasks: [
        { text: 'Historia personal: dónde grabaste, qué desafío tuviste, cómo lo resolviste', tag: 'historia' }
      ]},
      { label: 'Domingo', tasks: [
        { text: 'Planificar semana 3 + listar 15 potenciales clientes para prospección', tag: 'interaccion' }
      ]}
    ]
  },
  {
    num: 3,
    title: 'Prueba social y prospección',
    goal: 'Meta: +100 seguidores · Iniciar conversaciones de venta',
    days: [
      { label: 'Lunes', tasks: [
        { text: 'Reel testimonio: pedile una frase a tu cliente actual o contás el resultado', tag: 'reel' },
        { text: 'CTA: "¿Querés resultados así? Escribime"', tag: 'reel' },
        { text: '15 min interacción + enviar 3 DMs a potenciales clientes', tag: 'interaccion' }
      ]},
      { label: 'Martes', tasks: [
        { text: 'Historia con CTA directo: "Tengo 2 lugares disponibles para nuevos clientes"', tag: 'historia' },
        { text: 'Botón de respuesta activo en la historia', tag: 'historia' },
        { text: 'Enviar 3 DMs a potenciales clientes', tag: 'interaccion' }
      ]},
      { label: 'Miércoles', tasks: [
        { text: 'Reel de proceso: de la reunión a la entrega en 60 segundos', tag: 'reel' },
        { text: '15 min interacción + 3 DMs nuevos', tag: 'interaccion' }
      ]},
      { label: 'Jueves', tasks: [
        { text: 'Carrusel: "¿Cuánto cuesta no tener contenido profesional?"', tag: 'carrusel' },
        { text: '15 min interacción estratégica', tag: 'interaccion' }
      ]},
      { label: 'Viernes', tasks: [
        { text: 'Reel de nicho: "Por qué los clubes deportivos necesitan contenido en redes"', tag: 'reel' },
        { text: 'CTA: "¿Representás un club? Escribime"', tag: 'reel' },
        { text: 'Enviar 3 DMs finales de la semana', tag: 'interaccion' }
      ]},
      { label: 'Sábado', tasks: [
        { text: 'Live opcional 20 min respondiendo preguntas sobre contenido para marcas', tag: 'live' },
        { text: 'Si no hacés live: historia mostrando tu semana en Perú', tag: 'historia' }
      ]},
      { label: 'Domingo', tasks: [
        { text: 'Revisar respuestas a DMs y hacer seguimiento', tag: 'interaccion' },
        { text: 'Planificar semana 4', tag: 'interaccion' }
      ]}
    ]
  },
  {
    num: 4,
    title: 'Consolidar y cerrar clientes',
    goal: 'Meta: +120 seguidores · Cerrar al menos 1 cliente nuevo',
    days: [
      { label: 'Lunes', tasks: [
        { text: 'Reel resumen del mes: qué aprendiste publicando contenido consistente', tag: 'reel' },
        { text: '15 min interacción + seguimiento a DMs anteriores', tag: 'interaccion' }
      ]},
      { label: 'Martes', tasks: [
        { text: 'Historia de oferta concreta: pack de contenido mensual con precio o rango', tag: 'historia' },
        { text: 'Enviar 3 DMs con propuesta concreta', tag: 'interaccion' }
      ]},
      { label: 'Miércoles', tasks: [
        { text: 'Reel educativo nuevo basado en las preguntas más frecuentes recibidas', tag: 'reel' },
        { text: '15 min interacción', tag: 'interaccion' }
      ]},
      { label: 'Jueves', tasks: [
        { text: 'Carrusel portfolio: "Lo que hicimos este mes" con tus mejores trabajos', tag: 'carrusel' },
        { text: 'CTA: "Si querés ser parte del próximo mes, escribime"', tag: 'carrusel' }
      ]},
      { label: 'Viernes', tasks: [
        { text: 'Reel showreel: 30 seg con tu mejor material del mes + música', tag: 'reel' },
        { text: 'CTA fuerte: "Si querés ser parte del próximo mes, escribime"', tag: 'reel' },
        { text: '15 min interacción + cerrar conversaciones abiertas', tag: 'interaccion' }
      ]},
      { label: 'Sábado', tasks: [
        { text: 'Historia de cierre: agradecés a quienes te siguieron + CTA final', tag: 'historia' },
        { text: 'Hacer seguimiento a todos los DMs sin respuesta', tag: 'interaccion' }
      ]},
      { label: 'Domingo', tasks: [
        { text: 'Registrar métricas finales del mes en el tracker', tag: 'interaccion' },
        { text: 'Planificar mes 2 con lo aprendido', tag: 'interaccion' }
      ]}
    ]
  }
];

const METRIC_FIELDS = [
  { key: 'seguidores', label: 'Seguidores totales', placeholder: 'ej: 120' },
  { key: 'alcance', label: 'Alcance semanal', placeholder: 'ej: 1500' },
  { key: 'dms', label: 'DMs recibidos', placeholder: 'ej: 5' },
  { key: 'clientes', label: 'Clientes nuevos', placeholder: 'ej: 1' },
  { key: 'engagement', label: 'Engagement %', placeholder: 'ej: 6.5' }
];

const TARGETS = [
  { seguidores: 118, alcance: 500,  dms: 2, clientes: 0, engagement: 5 },
  { seguidores: 198, alcance: 1200, dms: 3, clientes: 0, engagement: 5 },
  { seguidores: 298, alcance: 2000, dms: 5, clientes: 1, engagement: 6 },
  { seguidores: 418, alcance: 3000, dms: 8, clientes: 2, engagement: 7 }
];

// ─── PLAN MULTI-MES ───────────────────────────────────────
const PLAN_START_DATE = '2026-07-01';