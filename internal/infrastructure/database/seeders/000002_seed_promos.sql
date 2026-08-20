TRUNCATE TABLE promo_codes RESTART IDENTITY CASCADE;

INSERT INTO
    promo_codes (
        code,
        description,
        discount_type,
        discount_value,
        is_active
    )
VALUES (
        'OPENING10',
        'Grand opening 10% discount for new customers',
        'percentage',
        10,
        true
    ),
    (
        'SUMMER500',
        'Hot day special 500 Yen off',
        'fixed',
        500,
        true
    ),
    (
        'MEILEE20',
        'Special red panda fan discount',
        'percentage',
        20,
        true
    ),
    (
        'TOKYO2026',
        'Local resident campaign discount',
        'percentage',
        15,
        true
    ),
    (
        'WINTEROFF',
        'Winter season flat discount',
        'fixed',
        300,
        false
    );