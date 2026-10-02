-- PharmaVital LOCAL DEVELOPMENT demo refresh only.
-- Never run this against Railway, production, or a database containing real records.
-- Connect to the intended local MySQL instance, then run:
--   SET @PHARMAVITAL_LOCAL_DEMO_RESET = 'YES_RESET_LOCAL_DEMO_ONLY';
--   SOURCE D:/PharmaVital/database/reset_demo_data.sql;
-- The procedure verifies both this explicit session confirmation and the target
-- database name before opening a transaction. It preserves every ROLE_ADMIN row.

USE epharmacy_db;

DROP PROCEDURE IF EXISTS reset_pharmavital_local_demo;
DELIMITER $$
CREATE PROCEDURE reset_pharmavital_local_demo()
BEGIN
    DECLARE admin_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF DATABASE() <> 'epharmacy_db'
       OR COALESCE(@PHARMAVITAL_LOCAL_DEMO_RESET, '') <> 'YES_RESET_LOCAL_DEMO_ONLY' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Reset refused: select epharmacy_db and explicitly confirm local demo reset in this session.';
    END IF;

    SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'ROLE_ADMIN';
    IF admin_count < 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Reset refused: no administrator account was found to preserve.';
    END IF;

    START TRANSACTION;

    -- Clear foreign-key dependants before their parent records.
    DELETE FROM cart_items;
    DELETE FROM reviews;
    DELETE FROM prescription_medicines;
    DELETE FROM order_items;
    DELETE FROM payments;
    DELETE FROM deliveries;
    DELETE FROM notifications;
    DELETE FROM cart
      WHERE user_id IN (SELECT id FROM users WHERE role <> 'ROLE_ADMIN');
    DELETE FROM prescriptions;
    DELETE FROM orders;

    -- Cascades remove each customer cart. Administrator records and credentials remain.
    DELETE FROM users WHERE role <> 'ROLE_ADMIN';

    DELETE FROM medicines;
    DELETE FROM categories;

    INSERT INTO categories (name, description) VALUES
      ('Daily Wellness', 'Everyday personal wellness and routine care products.'),
      ('Respiratory Care', 'Fictional demonstration products for the respiratory care range.'),
      ('Digestive Health', 'Fictional demonstration products for digestive wellness.'),
      ('Skin & Personal Care', 'Personal care products for the PharmaVital demonstration catalog.'),
      ('Women''s Wellness', 'Fictional products for the women''s wellness range.'),
      ('Men''s Wellness', 'Fictional products for the men''s wellness range.'),
      ('Immunity & Nutrition', 'Demonstration nutrition and daily supplement products.');

    INSERT INTO medicines
      (name, brand, composition, dosage, description, price, stock_quantity, category_id, requires_prescription, ailment, image_url, created_at, updated_at)
    VALUES
      ('VitaCore Daily', 'VitaCore', 'Demo botanical blend', '30 tablets', 'Fictional demonstration wellness product. Not intended for diagnosis or treatment.', 18.50, 84, (SELECT id FROM categories WHERE name = 'Daily Wellness'), FALSE, 'Daily wellness', '/products/daily-wellness.svg', NOW(), NOW()),
      ('Wellness D3', 'VitaCore', 'Demo nutrient blend', '60 softgels', 'Fictional demonstration nutrition product. Not intended for diagnosis or treatment.', 12.25, 112, (SELECT id FROM categories WHERE name = 'Daily Wellness'), FALSE, 'Daily wellness', '/products/daily-wellness.svg', NOW(), NOW()),
      ('RespiraEase Mist', 'Airwell', 'Demo saline blend', '100 ml', 'Fictional demonstration personal care product. Follow the product label.', 9.90, 46, (SELECT id FROM categories WHERE name = 'Respiratory Care'), FALSE, 'Respiratory care', '/products/respiratory-care.svg', NOW(), NOW()),
      ('RespiraEase Rx', 'Airwell', 'Demonstration formulation', '20 capsules', 'Fictional prescription-only demo item for workflow demonstrations; not a real medicine.', 24.00, 28, (SELECT id FROM categories WHERE name = 'Respiratory Care'), TRUE, 'Respiratory care', '/products/respiratory-care.svg', NOW(), NOW()),
      ('GastroCalm Balance', 'CoreKind', 'Demo fiber blend', '30 sachets', 'Fictional demonstration wellness product. Not intended for diagnosis or treatment.', 16.75, 57, (SELECT id FROM categories WHERE name = 'Digestive Health'), FALSE, 'Digestive health', '/products/digestive-health.svg', NOW(), NOW()),
      ('GastroCalm Daily', 'CoreKind', 'Demo botanical blend', '30 capsules', 'Fictional demonstration wellness product. Not intended for diagnosis or treatment.', 14.40, 63, (SELECT id FROM categories WHERE name = 'Digestive Health'), FALSE, 'Digestive health', '/products/digestive-health.svg', NOW(), NOW()),
      ('DermaShield Lotion', 'DermaShield', 'Demo skin-care blend', '200 ml', 'Fictional demonstration personal care product. For display and workflow testing.', 21.00, 39, (SELECT id FROM categories WHERE name = 'Skin & Personal Care'), FALSE, 'Skin and personal care', '/products/skin-personal-care.svg', NOW(), NOW()),
      ('DermaShield Cleanser', 'DermaShield', 'Demo skin-care blend', '150 ml', 'Fictional demonstration personal care product. For display and workflow testing.', 13.80, 5, (SELECT id FROM categories WHERE name = 'Skin & Personal Care'), FALSE, 'Skin and personal care', '/products/skin-personal-care.svg', NOW(), NOW()),
      ('LunaBalance Daily', 'LunaBalance', 'Demo botanical blend', '30 tablets', 'Fictional demonstration wellness product. Not intended for diagnosis or treatment.', 19.50, 42, (SELECT id FROM categories WHERE name = 'Women''s Wellness'), FALSE, 'Women''s wellness', '/products/womens-wellness.svg', NOW(), NOW()),
      ('LunaBalance Comfort', 'LunaBalance', 'Demonstration formulation', '20 capsules', 'Fictional prescription-only demo item for workflow demonstrations; not a real medicine.', 26.00, 18, (SELECT id FROM categories WHERE name = 'Women''s Wellness'), TRUE, 'Women''s wellness', '/products/womens-wellness.svg', NOW(), NOW()),
      ('ForgeWell Active', 'ForgeWell', 'Demo nutrient blend', '30 sachets', 'Fictional demonstration nutrition product. Not intended for diagnosis or treatment.', 17.25, 35, (SELECT id FROM categories WHERE name = 'Men''s Wellness'), FALSE, 'Men''s wellness', '/products/mens-wellness.svg', NOW(), NOW()),
      ('ForgeWell Hydration', 'ForgeWell', 'Demo electrolyte blend', '12 sachets', 'Fictional demonstration hydration product. Follow the product label.', 10.50, 76, (SELECT id FROM categories WHERE name = 'Men''s Wellness'), FALSE, 'Men''s wellness', '/products/mens-wellness.svg', NOW(), NOW()),
      ('NutriBalance Daily', 'NutriBalance', 'Demo nutrient blend', '60 capsules', 'Fictional demonstration nutrition product. Not intended for diagnosis or treatment.', 22.80, 91, (SELECT id FROM categories WHERE name = 'Immunity & Nutrition'), FALSE, 'Immunity and nutrition', '/products/immunity-nutrition.svg', NOW(), NOW()),
      ('HydraCare Mineral', 'HydraCare', 'Demo mineral blend', '20 sachets', 'Fictional demonstration hydration product. Follow the product label.', 11.60, 3, (SELECT id FROM categories WHERE name = 'Immunity & Nutrition'), FALSE, 'Immunity and nutrition', '/products/immunity-nutrition.svg', NOW(), NOW());

    COMMIT;
END$$
DELIMITER ;

CALL reset_pharmavital_local_demo();
DROP PROCEDURE reset_pharmavital_local_demo;

-- Verify after the call. The count can be greater than one if there are multiple admins.
SELECT role, COUNT(*) AS account_count FROM users GROUP BY role;
SELECT COUNT(*) AS category_count FROM categories;
SELECT COUNT(*) AS medicine_count FROM medicines;
SELECT COUNT(*) AS remaining_orders FROM orders;
SELECT COUNT(*) AS remaining_prescriptions FROM prescriptions;
