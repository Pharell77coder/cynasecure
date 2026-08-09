-- Une fois que tu t'es inscrit et vérifié via Maildev, passe ton compte en admin
-- pour accéder au back office (/admin/...).
-- Remplace 'ton@email.com' par ton adresse.

USE cynasecure;
UPDATE users SET role = 'admin' WHERE email = 'ton@email.com';
