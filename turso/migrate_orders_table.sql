-- Migración para agregar campos faltantes a la tabla orders
-- Ejecutar este script en tu base de datos Turso

-- Agregar campo customer_rut (RUT del cliente)
ALTER TABLE orders ADD COLUMN customer_rut TEXT;

-- Agregar campo payment_status (estado del pago)
-- Valores: 'pending', 'approved', 'rejected'
ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending';

-- Agregar campo shipping_status (estado del envío)
-- Valores: 'not_shipped', 'in_transit', 'delivered'
ALTER TABLE orders ADD COLUMN shipping_status TEXT NOT NULL DEFAULT 'not_shipped';

-- Agregar campo mercado_pago_preference_id (ID de la preferencia de pago de Mercado Pago)
ALTER TABLE orders ADD COLUMN mercado_pago_preference_id TEXT;

-- Agregar campo mercado_pago_payment_id (ID del pago de Mercado Pago)
ALTER TABLE orders ADD COLUMN mercado_pago_payment_id TEXT;

-- Actualizar el campo status existente para mantener compatibilidad
-- El campo status ahora representa el estado general de la orden
-- payment_status y shipping_status son más específicos

-- Crear índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON orders(shipping_status);
CREATE INDEX IF NOT EXISTS idx_orders_mp_preference_id ON orders(mercado_pago_preference_id);
CREATE INDEX IF NOT EXISTS idx_orders_mp_payment_id ON orders(mercado_pago_payment_id);

