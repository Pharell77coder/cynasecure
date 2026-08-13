UPDATE users
SET role = CASE 
    WHEN role = 'admin' THEN 'user'
    ELSE 'admin'
END
WHERE id = 1;