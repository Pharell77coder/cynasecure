<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class StrongPasswordValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (null === $value || '' === $value) return;

        $pw = (string) $value;

        if (mb_strlen($pw) < 8) {
            $this->context->addViolation('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        if (!preg_match('/[A-Z]/', $pw)) {
            $this->context->addViolation('Le mot de passe doit contenir au moins une majuscule.');
            return;
        }
        if (!preg_match('/[a-z]/', $pw)) {
            $this->context->addViolation('Le mot de passe doit contenir au moins une minuscule.');
            return;
        }
        if (!preg_match('/[0-9]/', $pw)) {
            $this->context->addViolation('Le mot de passe doit contenir au moins un chiffre.');
            return;
        }
        if (!preg_match('/[!@#$%^&*()\-_=+\[\]{};\':"\\\\|,.<>\/?]/', $pw)) {
            $this->context->addViolation('Le mot de passe doit contenir au moins un caractère spécial.');
        }
    }
}
