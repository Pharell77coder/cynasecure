<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $isNew = $options['is_new'];

        $builder
            ->add('email', EmailType::class, [
                'label' => 'Adresse e-mail',
                'attr'  => ['placeholder' => 'user@example.com'],
            ])
            ->add('roles', ChoiceType::class, [
                'label'    => 'Rôles',
                'choices'  => [
                    'Utilisateur' => 'ROLE_USER',
                    'Admin'       => 'ROLE_ADMIN',
                ],
                'multiple' => true,
                'expanded' => true,
            ])
            ->add('plainPassword', RepeatedType::class, [
                'type'            => PasswordType::class,
                'mapped'          => false,
                'required'        => $isNew,
                'first_options'   => ['label' => 'Mot de passe'],
                'second_options'  => ['label' => 'Confirmer le mot de passe'],
                'invalid_message' => 'Les mots de passe ne correspondent pas.',
                'constraints'     => $isNew
                    ? [
                        new NotBlank(['message' => 'Le mot de passe est obligatoire.']),
                        new Length(['min' => 8, 'minMessage' => 'Minimum {{ limit }} caractères.']),
                    ]
                    : [
                        new Length(['min' => 8, 'minMessage' => 'Minimum {{ limit }} caractères.']),
                    ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'is_new'     => true,
        ]);

        $resolver->setAllowedTypes('is_new', 'bool');
    }
}
