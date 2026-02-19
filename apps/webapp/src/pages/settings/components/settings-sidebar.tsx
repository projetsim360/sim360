import {
  ScrollspyMenu,
  type ScrollspyMenuItems,
} from '@/components/layouts/layout-1/shared/navbar/scrollspy-menu';

export function SettingsSidebar() {
  const items: ScrollspyMenuItems = [
    {
      title: 'Paramètres de base',
      target: 'basic_settings',
      active: true,
    },
    {
      title: 'Authentification',
      children: [
        {
          title: 'Email',
          target: 'auth_email',
        },
        {
          title: 'Mot de passe',
          target: 'auth_password',
        },
        {
          title: 'Connexion sociale',
          target: 'auth_social',
        },
        {
          title: 'Double auth. (2FA)',
          target: 'auth_two_factor',
        },
      ],
    },
    {
      title: 'Paramètres avancés',
      children: [
        {
          title: 'Préférences',
          target: 'preferences_general',
        },
        {
          title: 'Apparence',
          target: 'preferences_appearance',
        },
        {
          title: 'Notifications',
          target: 'preferences_notifications',
        },
      ],
    },
    {
      title: 'Mise en page',
      target: 'layout_settings',
    },
    {
      title: 'Supprimer le compte',
      target: 'delete_account',
    },
  ];

  return <ScrollspyMenu items={items} />;
}
