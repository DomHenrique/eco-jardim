-- =====================================================
-- Ecojardim & Pedras - Database Schema
-- PostgreSQL / Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    zip VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'employee', 'admin'
    auth_user_id UUID REFERENCES auth.users(id), -- Link to Supabase Auth
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for faster name searches
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Index for auth_user_id lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cpf_cnpj VARCHAR(20), -- CPF or CNPJ for invoicing
    -- Main/Billing Address
    billing_address TEXT,
    billing_city VARCHAR(100),
    billing_state VARCHAR(2),
    billing_zip VARCHAR(20),
    billing_neighborhood VARCHAR(100),
    billing_complement VARCHAR(255),
    -- Additional Info
    notes TEXT, -- Internal notes about the customer
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_cpf_cnpj ON customers(cpf_cnpj);

-- =====================================================
-- DELIVERY ADDRESSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS delivery_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    label VARCHAR(100), -- e.g., "Casa", "Trabalho", "Sítio"
    recipient_name VARCHAR(255), -- Can be different from customer name
    recipient_phone VARCHAR(20),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(20) NOT NULL,
    neighborhood VARCHAR(100),
    complement VARCHAR(255),
    reference_point TEXT, -- e.g., "Próximo ao mercado X"
    is_default BOOLEAN DEFAULT false, -- Default delivery address
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for delivery addresses
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_customer_id ON delivery_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_is_default ON delivery_addresses(is_default);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    usage TEXT,
    measurements VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    image_storage_type VARCHAR(20) DEFAULT 'placeholder', -- 'minio', 'external', 'placeholder'
    unit VARCHAR(50) NOT NULL,
    tags TEXT[], -- Array of tags for colors and specific types
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Index for tag searches
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Index for name searches
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- =====================================================
-- SERVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    image_storage_type VARCHAR(20) DEFAULT 'placeholder', -- 'minio', 'external', 'placeholder'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- Index for name searches
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);

-- =====================================================
-- BUDGETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id), -- Associated order if budget was converted
    customer_id UUID NOT NULL REFERENCES customers(id),
    items JSONB NOT NULL, -- Array of cart items
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax DECIMAL(10, 2) CHECK (tax >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL, -- Expiration date
    notes TEXT,
    created_by UUID REFERENCES users(id), -- Employee ID who created the budget
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for customer budgets
CREATE INDEX IF NOT EXISTS idx_budgets_customer_id ON budgets(customer_id);

-- Index for budget status
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);

-- Index for budget validity
CREATE INDEX IF NOT EXISTS idx_budgets_valid_until ON budgets(valid_until);

-- Index for created_by (employee)
CREATE INDEX IF NOT EXISTS idx_budgets_created_by ON budgets(created_by);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    items JSONB NOT NULL, -- Array of cart items
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    user_info JSONB NOT NULL, -- User information snapshot
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    budget_id UUID REFERENCES budgets(id), -- Reference to budget if order originated from budget
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('credit', 'debit', 'pix', 'boleto', 'cash')),
    delivery_address TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'quotation', 'quoted', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled', 'rejected'))
);

-- Index for user orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Index for order status
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index for order date
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);

-- Index for created_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for services table
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for customers table
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for delivery_addresses table
DROP TRIGGER IF EXISTS update_delivery_addresses_updated_at ON delivery_addresses;
CREATE TRIGGER update_delivery_addresses_updated_at
    BEFORE UPDATE ON delivery_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: Allow public read access
CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    USING (true);

-- Products: Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage products"
    ON products FOR ALL
    USING (auth.role() = 'authenticated');

-- Services: Allow public read access
CREATE POLICY "Services are viewable by everyone"
    ON services FOR SELECT
    USING (true);

-- Services: Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage services"
    ON services FOR ALL
    USING (auth.role() = 'authenticated');

-- Users: Users can view their own data
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (auth.uid() = auth_user_id);

-- Users: Users can update their own data
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid() = auth_user_id);

-- Users: Allow authenticated users to create new accounts
CREATE POLICY "Allow authenticated user creation"
    ON users FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' OR true);

-- Users: Allow service role (backend) to manage users
CREATE POLICY "Service role can manage users"
    ON users FOR ALL
    USING (auth.role() = 'service_role');

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

-- Orders: Users can create orders
CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Orders: Users can update their own pending orders
CREATE POLICY "Users can update own pending orders"
    ON orders FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Customers: Users can view their own customer data
CREATE POLICY "Users can view own customer data"
    ON customers FOR SELECT
    USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

-- Customers: Users can create their own customer profile
CREATE POLICY "Users can create customer profile"
    ON customers FOR INSERT
    WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

-- Customers: Users can update their own customer data
CREATE POLICY "Users can update own customer data"
    ON customers FOR UPDATE
    USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

-- Delivery Addresses: Users can view their own delivery addresses
CREATE POLICY "Users can view own delivery addresses"
    ON delivery_addresses FOR SELECT
    USING (auth.uid() = (SELECT u.auth_user_id FROM users u JOIN customers c ON u.id = c.user_id WHERE c.id = customer_id));

-- Delivery Addresses: Users can create their own delivery addresses
CREATE POLICY "Users can create delivery addresses"
    ON delivery_addresses FOR INSERT
    WITH CHECK (auth.uid() = (SELECT u.auth_user_id FROM users u JOIN customers c ON u.id = c.user_id WHERE c.id = customer_id));

-- Delivery Addresses: Users can update their own delivery addresses
CREATE POLICY "Users can update own delivery addresses"
    ON delivery_addresses FOR UPDATE
    USING (auth.uid() = (SELECT u.auth_user_id FROM users u JOIN customers c ON u.id = c.user_id WHERE c.id = customer_id));

-- Delivery Addresses: Users can delete their own delivery addresses
CREATE POLICY "Users can delete own delivery addresses"
    ON delivery_addresses FOR DELETE
    USING (auth.uid() = (SELECT u.auth_user_id FROM users u JOIN customers c ON u.id = c.user_id WHERE c.id = customer_id));

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample products
INSERT INTO products (name, description, usage, measurements, price, category, image_url, unit, tags) VALUES
    ('Pedra Portuguesa Branca', 'Pedra ornamental clássica portuguesa', 'Calçadas, jardins, áreas externas', '10x10 cm', 45.00, 'Pedras Ornamentais', 'https://example.com/pedra-portuguesa-branca.jpg', 'm²', ARRAY['branca', 'portuguesa', 'clássica']),
    ('Pedra São Tomé', 'Pedra rústica para jardins', 'Jardins, caminhos, decoração', 'Irregular', 35.00, 'Pedras Ornamentais', 'https://example.com/pedra-sao-tome.jpg', 'm²', ARRAY['rústica', 'irregular']),
    ('Bloquete Intertravado', 'Bloquete para pavimentação', 'Estacionamentos, calçadas', '20x10x6 cm', 28.00, 'Bloquetes e Pavers', 'https://example.com/bloquete.jpg', 'm²', ARRAY['cinza', 'intertravado'])
ON CONFLICT DO NOTHING;

-- Insert sample services
INSERT INTO services (name, description, price, unit, category, image_url) VALUES
    ('Instalação de Pedras Ornamentais', 'Serviço profissional de instalação de pedras', 80.00, 'm²', 'Instalação', 'https://example.com/instalacao.jpg'),
    ('Manutenção de Jardim', 'Serviço completo de manutenção e limpeza', 120.00, 'hora', 'Manutenção', 'https://example.com/manutencao.jpg'),
    ('Projeto Paisagístico', 'Desenvolvimento de projeto paisagístico personalizado', 500.00, 'projeto', 'Consultoria', 'https://example.com/projeto.jpg')
ON CONFLICT DO NOTHING;

-- =====================================================
-- USEFUL QUERIES (For reference)
-- =====================================================

-- Get all products by category
-- SELECT * FROM products WHERE category = 'Pedras Ornamentais' ORDER BY name;

-- Search products by name or description
-- SELECT * FROM products WHERE name ILIKE '%pedra%' OR description ILIKE '%pedra%';

-- Get user orders with total count
-- SELECT u.name, COUNT(o.id) as order_count, SUM(o.total) as total_spent
-- FROM users u
-- LEFT JOIN orders o ON u.id = o.user_id
-- GROUP BY u.id, u.name;

-- Get orders by status
-- SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;

-- Get products with specific tags
-- SELECT * FROM products WHERE tags @> ARRAY['branca'];

-- =====================================================
-- LOGGING & AUDIT SYSTEM
-- =====================================================

-- 1. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID DEFAULT auth.uid(), -- Null if system change
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 2. User Activity Logs Table
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- e.g., 'LOGIN', 'LOGOUT', 'VIEW_PRODUCT', 'ADD_TO_CART'
    details JSONB, -- IP, User Agent, Product ID, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- 3. Persistent Carts Table (for Abandoned Cart tracking)
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Nullable for guest carts if needed later
    items JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_updated_at ON carts(updated_at);

-- Trigger for carts updated_at
DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUDIT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    old_row JSONB := NULL;
    new_row JSONB := NULL;
BEGIN
    IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
        old_row = to_jsonb(OLD);
    END IF;
    
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        new_row = to_jsonb(NEW);
    END IF;

    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        old_row,
        new_row,
        auth.uid()
    );
    
    RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Audit Triggers to Critical Tables
DROP TRIGGER IF EXISTS audit_products ON products;
CREATE TRIGGER audit_products
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_orders ON orders;
CREATE TRIGGER audit_orders
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_customers ON customers;
CREATE TRIGGER audit_customers
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_budgets ON budgets;
CREATE TRIGGER audit_budgets
    AFTER INSERT OR UPDATE OR DELETE ON budgets
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Audit Logs: Admins/Employees can view
CREATE POLICY "Employees can view audit logs"
    ON audit_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('employee', 'admin')));

-- User Activity Logs: Users can create, Employees can view
CREATE POLICY "Users can create activity logs"
    ON user_activity_logs FOR INSERT
    WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Employees can view activity logs"
    ON user_activity_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('employee', 'admin')));

-- Carts: Users can manage their own carts
CREATE POLICY "Users can manage own carts"
    ON carts FOR ALL
    USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Employees can view all carts"
    ON carts FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('employee', 'admin')));

-- Budgets: Customers can view their own budgets
CREATE POLICY "Customers can view own budgets"
    ON budgets FOR SELECT
    USING (auth.uid() = (SELECT u.auth_user_id FROM users u JOIN customers c ON u.id = c.user_id WHERE c.id = customer_id));

-- Budgets: Only employees and admins can manage budgets (create, update, delete)
CREATE POLICY "Employees can manage budgets"
    ON budgets FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('employee', 'admin')));

-- Budgets: Only employees and admins can update budgets (more specific policy)
CREATE POLICY "Employees can update budgets"
    ON budgets FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('employee', 'admin')));

-- Budgets: Employees can view all budgets
CREATE POLICY "Employees can view all budgets"
    ON budgets FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('employee', 'admin')));
