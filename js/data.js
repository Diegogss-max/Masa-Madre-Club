/* ===================================================
   MASA MADRE CLUB — Data Layer
   Esquema de base de datos + datos mock
   =================================================== */

const MMC = (function() {
  'use strict';

  // =============================================
  // DATABASE SCHEMA & MOCK DATA
  // =============================================

  const DB = {
    users: [
      {
        id: 'u001',
        name: 'María Fernández',
        email: 'maria@gmail.com',
        phone: '+56912345678',
        role: 'client',
        address: {
          street: 'Av. Libertad 1250, Depto 802',
          commune: 'Viña del Mar',
          city: 'Viña del Mar',
          notes: 'Conserjería: dejar con el conserje Rodrigo en turno mañana'
        },
        avatar: '👩‍💼',
        created_at: '2026-01-15T10:00:00Z'
      },
      {
        id: 'u002',
        name: 'Panadería El Abuelo',
        email: 'elabuelo@gmail.com',
        phone: '+56987654321',
        role: 'partner',
        address: {
          street: 'Calle Quillota 450',
          commune: 'Viña Centro',
          city: 'Viña del Mar'
        },
        avatar: '🏪',
        created_at: '2025-11-01T08:00:00Z'
      },
      {
        id: 'u003',
        name: 'Carlos Muñoz',
        email: 'carlos.delivery@gmail.com',
        phone: '+56911223344',
        role: 'delivery',
        avatar: '🚲',
        created_at: '2026-02-01T07:00:00Z'
      }
    ],

    subscriptions: [
      {
        id: 'sub001',
        user_id: 'u001',
        plan: 'standard',
        days_per_week: 3,
        selected_days: ['Lunes', 'Miércoles', 'Viernes'],
        time_slot: '07:00-08:30',
        bread_types: [
          { type: 'integral', label: 'Masa Madre Integral', quantity: 2, emoji: '🌾' },
          { type: 'semillas', label: 'Hogaza de Semillas', quantity: 1, emoji: '🌻' }
        ],
        delivery_notes: 'Dejar en conserjería con conserje Rodrigo',
        status: 'active',
        pause_until: null,
        next_delivery: '2026-06-05',
        monthly_price: 29900,
        partner_id: 'p001'
      }
    ],

    partners: [
      {
        id: 'p001',
        name: 'Panadería El Abuelo',
        owner_name: 'Jorge Soto',
        address: {
          street: 'Calle Quillota 450',
          commune: 'Viña Centro',
          city: 'Viña del Mar'
        },
        commune: 'Viña Centro',
        bread_types: [
          { type: 'integral', label: 'Masa Madre Integral', price: 1200, emoji: '🌾' },
          { type: 'semillas', label: 'Hogaza de Semillas', price: 1400, emoji: '🌻' },
          { type: 'baguette_fit', label: 'Baguette Fit', price: 1100, emoji: '🥖' }
        ],
        daily_production_limit: 80,
        status: 'active',
        rating: 4.9,
        deliveries_completed: 1240
      },
      {
        id: 'p002',
        name: 'Almacén La Granja',
        owner_name: 'Ana Villanueva',
        address: {
          street: 'Av. Valparaíso 350',
          commune: 'Viña Centro',
          city: 'Viña del Mar'
        },
        commune: 'Viña Centro',
        bread_types: [
          { type: 'integral', label: 'Masa Madre Integral', price: 1200, emoji: '🌾' },
          { type: 'baguette_fit', label: 'Baguette Fit', price: 1100, emoji: '🥖' }
        ],
        daily_production_limit: 50,
        status: 'active',
        rating: 4.7,
        deliveries_completed: 890
      }
    ],

    deliveries: [
      {
        id: 'd001',
        subscription_id: 'sub001',
        user_id: 'u001',
        user_name: 'María Fernández',
        delivery_person_id: 'u003',
        partner_id: 'p001',
        scheduled_date: '2026-06-05',
        time_slot: '07:00-08:30',
        status: 'in_transit',
        proof_photo_url: null,
        delivered_at: null,
        address: {
          street: 'Av. Libertad 1250, Depto 802',
          commune: 'Viña del Mar',
          notes: 'Conserjería: Rodrigo'
        },
        items: [
          { type: 'integral', quantity: 2 },
          { type: 'semillas', quantity: 1 }
        ]
      },
      {
        id: 'd002',
        subscription_id: 'sub002',
        user_id: 'u004',
        user_name: 'Sebastián Torres',
        delivery_person_id: 'u003',
        partner_id: 'p001',
        scheduled_date: '2026-06-05',
        time_slot: '07:00-08:30',
        status: 'preparing',
        proof_photo_url: null,
        delivered_at: null,
        address: {
          street: 'Av. San Martín 415, Casa',
          commune: 'Viña del Mar',
          notes: 'Timbre 2B, dejar en puerta si no hay respuesta'
        },
        items: [
          { type: 'baguette_fit', quantity: 2 }
        ]
      },
      {
        id: 'd003',
        subscription_id: 'sub003',
        user_id: 'u005',
        user_name: 'Valentina Riquelme',
        delivery_person_id: 'u003',
        partner_id: 'p001',
        scheduled_date: '2026-06-05',
        time_slot: '07:00-08:30',
        status: 'delivered',
        proof_photo_url: 'delivered',
        delivered_at: '2026-06-05T07:42:00Z',
        address: {
          street: 'Calle 1 Norte 890, Depto 1502',
          commune: 'Viña del Mar',
          notes: 'Conserjería: dejar en recepción'
        },
        items: [
          { type: 'integral', quantity: 1 },
          { type: 'semillas', quantity: 1 }
        ]
      },
      {
        id: 'd004',
        subscription_id: 'sub004',
        user_id: 'u006',
        user_name: 'Rodrigo Espinoza',
        delivery_person_id: 'u003',
        partner_id: 'p001',
        scheduled_date: '2026-06-05',
        time_slot: '07:00-08:30',
        status: 'preparing',
        proof_photo_url: null,
        delivered_at: null,
        address: {
          street: 'Av. Marina 250, Depto 204',
          commune: 'Viña del Mar',
          notes: 'Timbre exterior: 204, llamar si no responde'
        },
        items: [
          { type: 'integral', quantity: 2 },
          { type: 'baguette_fit', quantity: 1 }
        ]
      }
    ],

    production_orders: [
      {
        id: 'po001',
        partner_id: 'p001',
        date: '2026-06-05',
        items: [
          { bread_type: 'integral', label: 'Masa Madre Integral', quantity: 34, emoji: '🌾' },
          { bread_type: 'semillas', label: 'Hogaza de Semillas', quantity: 18, emoji: '🌻' },
          { bread_type: 'baguette_fit', label: 'Baguette Fit', quantity: 22, emoji: '🥖' }
        ],
        ingredients: [
          { name: 'Harina integral orgánica', unit: 'kg', quantity: 18.5, emoji: '🌾' },
          { name: 'Starter de masa madre', unit: 'g', quantity: 740, emoji: '🧫' },
          { name: 'Sal de mar', unit: 'g', quantity: 480, emoji: '🧂' },
          { name: 'Agua filtrada', unit: 'L', quantity: 22, emoji: '💧' },
          { name: 'Semillas mixtas', unit: 'g', quantity: 900, emoji: '🌻' },
          { name: 'Semillas de chía', unit: 'g', quantity: 320, emoji: '⚫' }
        ],
        status: 'in_production',
        subscriptions_count: 74,
        total_units: 74
      }
    ],

    physical_stock: {
      partner_id: 'p001',
      date: '2026-06-05',
      items: [
        {
          type: 'integral',
          label: 'Pan Integral Mini (50g)',
          emoji: '🌾',
          allocated_subscriptions: 34,
          stock_display: 12,
          price_display: 890,
          sold_today: 7,
          remaining: 5
        },
        {
          type: 'baguette_fit',
          label: 'Baguette Fit Mini (40g)',
          emoji: '🥖',
          allocated_subscriptions: 22,
          stock_display: 8,
          price_display: 690,
          sold_today: 3,
          remaining: 5
        }
      ],
      cross_sell: [
        { item: 'Palta Hass (unidad)', price: 690, emoji: '🥑', sold: 12 },
        { item: 'Quesillo artesanal (100g)', price: 990, emoji: '🧀', sold: 8 },
        { item: 'Mermelada de berries', price: 2490, emoji: '🫐', sold: 4 }
      ]
    }
  };

  // =============================================
  // STATE
  // =============================================

  const STATE = {
    currentUser: null,
    currentRole: 'client', // 'client' | 'partner' | 'delivery'
    configurator: {
      step: 1,
      daysPerWeek: null,
      selectedDays: [],
      timeSlot: null,
      breadTypes: {},
      deliveryNotes: ''
    },
    checkout: {
      plan: null,
      price: 0
    }
  };

  // =============================================
  // BUSINESS LOGIC
  // =============================================

  const PLANS = {
    2: { label: 'Plan Básico', price: 22900, description: '2 días por semana' },
    3: { label: 'Plan Estándar', price: 29900, description: '3 días por semana' },
    5: { label: 'Plan Completo', price: 44900, description: '5 días por semana' }
  };

  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const TIME_SLOTS = [
    { id: 'slot1', label: '07:00 – 08:30', description: 'Madrugador 🌅', icon: '🌅' },
    { id: 'slot2', label: '08:30 – 10:00', description: 'Tranquilo ☀️', icon: '☀️' }
  ];

  const BREAD_TYPES = [
    {
      type: 'integral',
      label: 'Masa Madre Integral',
      emoji: '🌾',
      description: 'El clásico. Fermentación lenta 18 horas. Sin levadura comercial.',
      tags: ['Alta fibra', 'Sin aditivos', 'Digestión fácil'],
      price_per_unit: 1200
    },
    {
      type: 'semillas',
      label: 'Hogaza de Semillas',
      emoji: '🌻',
      description: 'Rellena de chía, linaza y semillas de zapallo. Omega-3 natural.',
      tags: ['Omega-3', 'Sin gluten añadido', 'Saciedad'],
      price_per_unit: 1400
    },
    {
      type: 'baguette_fit',
      label: 'Baguette Fit',
      emoji: '🥖',
      description: 'Formato clásico francés pero con masa madre real. Corteza crujiente.',
      tags: ['Bajo índice glicémico', 'Corteza artesanal', 'Formato familiar'],
      price_per_unit: 1100
    }
  ];

  // RULE: Changes must be made 24h before delivery
  function canModify(deliveryDate) {
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const hoursUntil = (delivery - now) / (1000 * 60 * 60);
    return hoursUntil >= 24;
  }

  // Compute production from active subscriptions
  function computeProductionOrder(partnerId, date) {
    return DB.production_orders.find(po => po.partner_id === partnerId && po.date === date);
  }

  function getDeliveryStatus(status) {
    const map = {
      'preparing':  { label: 'En Preparación', color: 'warning', icon: '🔥' },
      'in_transit': { label: 'En Camino',       color: 'earth',   icon: '🚲' },
      'delivered':  { label: 'Entregado',        color: 'success', icon: '✅' },
      'failed':     { label: 'No entregado',     color: 'error',   icon: '❌' }
    };
    return map[status] || map['preparing'];
  }

  function formatCLP(amount) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-CL', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // =============================================
  // MICRO-COPIES (Narrativa Artesanal)
  // =============================================

  const MICRO_COPIES = [
    "Agua, harina, sal y tiempo. Nada más.",
    "Hecho hoy: Más liviano, mejor digestión.",
    "El pan de los abuelos, en tu puerta. Sin químicos, sin culpa.",
    "Fermentación lenta = más sabor, menos hinchazón.",
    "Sin levadura comercial. Sin conservantes. Sin trucos.",
    "Tu intestino te lo va a agradecer. ❤️"
  ];

  // =============================================
  // PUBLIC API
  // =============================================

  return {
    DB, STATE, PLANS, DAYS, TIME_SLOTS, BREAD_TYPES,
    MICRO_COPIES, canModify, computeProductionOrder,
    getDeliveryStatus, formatCLP, formatDate
  };

})();
