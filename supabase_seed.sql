-- SEED DATA FOR ELITE SHIELD SHOOTING CLUB
-- Copy and run this in your Supabase SQL Editor

-- 1. CLEANUP (Optional - Be careful)
-- DELETE FROM products;

-- 2. INSERT PRODUCTS (Lanchonete / Bar)
INSERT INTO products (name, category, price, stock, unit, business_unit) VALUES
('Coca Cola Lata 350ml', 'Lanchonete', 6.00, 100, 'un', 'BAR'),
('Guaraná Antarctica Lata 350ml', 'Lanchonete', 6.00, 80, 'un', 'BAR'),
('Água Mineral Sem Gás 500ml', 'Lanchonete', 4.00, 150, 'un', 'BAR'),
('Água Mineral Com Gás 500ml', 'Lanchonete', 4.50, 100, 'un', 'BAR'),
('Powerade Isotônico', 'Lanchonete', 12.00, 40, 'un', 'BAR'),
('Red Bull Energy Drink', 'Lanchonete', 15.00, 60, 'un', 'BAR'),
('Batata Ruffles Original 50g', 'Lanchonete', 8.00, 50, 'un', 'BAR'),
('Doritos Queijo Nacho 50g', 'Lanchonete', 8.00, 50, 'un', 'BAR'),
('Amendoim Japonês 100g', 'Lanchonete', 7.00, 40, 'un', 'BAR'),
('Chocolate KitKat', 'Lanchonete', 5.00, 60, 'un', 'BAR'),
('Barra de Cereal Proteica', 'Lanchonete', 9.00, 30, 'un', 'BAR'),
('Halls Preto (Extra Forte)', 'Lanchonete', 3.00, 100, 'un', 'BAR'),
('Trident Menta', 'Lanchonete', 3.00, 100, 'un', 'BAR');

-- 3. INSERT CONSUMABLES (Alvos, Miras, Proteção)
INSERT INTO products (name, category, price, stock, unit, business_unit) VALUES
('Alvo Papel Oficial 4 Cores', 'Alvos', 3.50, 500, 'un', 'CLUB'),
('Alvo Humanóide Tático', 'Alvos', 5.00, 300, 'un', 'CLUB'),
('Alvo Metálico IPSC Mini', 'Alvos', 150.00, 10, 'un', 'SHOP'),
('Adesivo Tapa Furo (Rolo 1000)', 'Acessorio', 25.00, 50, 'un', 'SHOP'),
('Protetor Auricular Tipo Concha 3M', 'Equipamento', 89.90, 20, 'un', 'SHOP'),
('Protetor Auricular Eletrônico Walkers', 'Equipamento', 450.00, 5, 'un', 'SHOP'),
('Protetor Auricular Espuma (Descartável)', 'Equipamento', 2.00, 200, 'par', 'CLUB'),
('Óculos de Proteção Transparente', 'Equipamento', 45.00, 30, 'un', 'SHOP'),
('Óculos Tático Lente Amarela', 'Equipamento', 65.00, 20, 'un', 'SHOP');

-- 4. INSERT GEAR (Vestuário, Tático)
INSERT INTO products (name, category, price, stock, unit, business_unit) VALUES
('Camiseta Elite Shield Tática Preta', 'Vestuario', 89.90, 50, 'un', 'SHOP'),
('Boné Tático com Velcro', 'Vestuario', 59.90, 40, 'un', 'SHOP'),
('Calça Tática Ripstop (Preta)', 'Vestuario', 220.00, 15, 'un', 'SHOP'),
('Calça Tática Ripstop (Coyote)', 'Vestuario', 220.00, 15, 'un', 'SHOP'),
('Coturno Tático Leve Dry', 'Vestuario', 450.00, 10, 'par', 'SHOP'),
('Cinto Tático Rígido', 'Acessorio', 120.00, 20, 'un', 'SHOP'),
('Coldre Kydex G19 OWB', 'Acessorio', 350.00, 8, 'un', 'SHOP'),
('Coldre Kydex G19 IWB', 'Acessorio', 350.00, 8, 'un', 'SHOP'),
('Porta Carregador Duplo', 'Acessorio', 180.00, 12, 'un', 'SHOP'),
('Bandoleira 2 Pontas', 'Acessorio', 90.00, 15, 'un', 'SHOP');

-- 5. INSERT LANES (Pistas) - Only if you want to seed tracks
INSERT INTO lanes (name, type, max_distance, max_caliber, status) VALUES
('Pista Alpha 01', 'indoor', 25, '.45 ACP', 'available'),
('Pista Alpha 02', 'indoor', 25, '.45 ACP', 'available'),
('Pista Alpha 03', 'indoor', 25, '.45 ACP', 'occupied'),
('Pista Bravo Tática', 'tactical', 50, '5.56 NATO', 'available'),
('Pista Charlie Longa', 'outdoor', 100, '7.62 NATO', 'maintenance');
