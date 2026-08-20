-- Truncating orders will also cascade to order_items due to the ON DELETE CASCADE constraint
TRUNCATE TABLE orders, order_items RESTART IDENTITY CASCADE;

-- 1. Insert Dummy Orders
INSERT INTO
    orders (
        order_code,
        order_type,
        seat_number,
        total_price,
        status,
        created_at
    )
VALUES (
        'ORD-0001',
        'Eat-in',
        12,
        1350,
        'served',
        CURRENT_TIMESTAMP - INTERVAL '2 hours'
    ),
    (
        'ORD-0002',
        'Takeout',
        NULL,
        1200,
        'pending',
        CURRENT_TIMESTAMP - INTERVAL '10 minutes'
    ),
    (
        'ORD-0003',
        'Eat-in',
        4,
        1150,
        'making',
        CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    ),
    (
        'ORD-0004',
        'Eat-in',
        7,
        850,
        'served',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );

-- 2. Insert Dummy Order Items (referencing the order_ids 1 through 4 generated above)
INSERT INTO
    order_items (
        order_id,
        name,
        price,
        quantity
    )
VALUES
    -- Items for ORD-0001 (Total: 600 + 750 = 1350)
    (1, 'いちごかき氷', 600, 1),
    (1, '宇治金時抹茶', 750, 1),

-- Items for ORD-0002 (Total: 600 * 2 = 1200)
(2, 'いちごかき氷', 600, 2),

-- Items for ORD-0003 (Total: 700 + 450 = 1150)
(3, 'マンゴーかき氷', 700, 1), (3, 'さくらもちセット', 450, 1),

-- Items for ORD-0004 (Total: 400 + 450 = 850)
(4, '特製わらび餅', 400, 1), (4, 'さくらもちセット', 450, 1);