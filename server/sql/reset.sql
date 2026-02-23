TRUNCATE order_items, orders RESTART IDENTITY CASCADE;
DELETE FROM users WHERE role <> 'admin';
