<?php
// $Id$

/*******************************************************************************
 * Callback Functions, Forms, and Tables
 ******************************************************************************/

function offline_signup_user_router_form() {
  $form['mail'] = array(
    '#type' => 'textfield',
    '#title' => t('E-mail address'),
    '#maxlength' => EMAIL_MAX_LENGTH,
    '#description' => t('A valid e-mail address. All e-mails from the system will be sent to this address. The e-mail address is not made public and will only be used if you wish to receive a new password or wish to receive certain news or notifications by e-mail.'),
    '#attributes' => array('placeholder' => 'email@example.com'),
    '#required' => TRUE
  );
  $form['next'] = array(
    '#type' => 'button',
    '#value' => t('Next')
  );
  return $form;
}

function offline_signup_user_register_form() {
  $form['mail'] = array(
    '#type' => 'textfield',
    '#title' => t('E-mail address'),
    '#maxlength' => EMAIL_MAX_LENGTH,
    '#description' => t('A valid e-mail address. All e-mails from the system will be sent to this address. The e-mail address is not made public and will only be used if you wish to receive a new password or wish to receive certain news or notifications by e-mail.'),
    '#required' => TRUE
  );

  if (module_exists('profile')) {
    $form += profile_form_profile($form, NULL, variable_get('offline_signup_profile_category', 'account'), TRUE);
  }

  if (module_exists('content_profile_registration')) {
    module_load_include('inc', 'offline_signup', 'offline_signup.profile');

    $form += offline_signup_profile_types_form();
  }

  $form['buttons'] = array('#weight' => 10);
  $form['buttons']['back'] = array(
    '#type' => 'button',
    '#value' => t('Back'),
    '#name' => 'back'
  );
  $form['buttons']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Create new account'),
    '#name' => 'create'
  );

  return $form;
}

function offline_signup_user_update_form() {
  $form['mail'] = array(
    '#type' => 'textfield',
    '#title' => t('E-mail address'),
    '#maxlength' => EMAIL_MAX_LENGTH,
    '#description' => t('A valid e-mail address. All e-mails from the system will be sent to this address. The e-mail address is not made public and will only be used if you wish to receive a new password or wish to receive certain news or notifications by e-mail.'),
    '#required' => TRUE
  );
  $form['pass'] = array(
    '#type' => 'password_confirm',
    '#size' => 25
  );

  if (module_exists('content_profile')) {
    module_load_include('inc', 'offline_signup', 'offline_signup.profile');

    $form += offline_signup_profile_types_form();
  }

  $form['buttons'] = array('#weight' => 10);
  $form['buttons']['back'] = array(
    '#type' => 'button',
    '#value' => t('Back'),
    '#name' => 'back'
  );
  $form['buttons']['update'] = array(
    '#type' => 'submit',
    '#value' => t('Update account'),
    '#name' => 'update'
  );

  return $form;
}

function offline_signup_settings_form() {
  $form['information'] = array(
    '#type' => 'fieldset',
    '#title' => t('Event information')
  );
  $form['information']['event'] = array(
    '#type' => 'textfield',
    '#title' => t('Event'),
    '#required' => TRUE
  );
  $form['drawing'] = array(
    '#type' => 'fieldset',
    '#title' => t('Drawing')
  );
  $form['drawing']['drawings'] = array(
    '#type' => 'select',
    '#title' => t('Number of drawings'),
    '#options' => range(0, 5)
  );
  $form['save'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
    '#name' => 'save'
  );
  return $form;
}

function offline_signup_winners_page() {
  
}

function offline_signup_sync_form() {
  $form['sync'] = array(
    '#type' => 'submit',
    '#value' => t('Sync now'),
    '#name' => 'sync'
  );
  return $form;
}

/*******************************************************************************
 * Theme Functions
 ******************************************************************************/

function theme_offline_signup_page() {
  drupal_add_css(drupal_get_path('module', 'offline_signup') .'/offline_signup.css');
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/offline_signup.js');

  $result = db_query("SELECT name, mail FROM {users} WHERE uid > 0");
  $emails = array();
  while ($data = db_fetch_object($result)) {
    $emails[$data->name] = $data->mail;
  }
  drupal_add_js(array('offlineSignup' => array('emails' => $emails)), 'setting');

  $output = theme('offline_signup_dependency_message', t('This page is dependent on JavaScript to function.'));
  $output .= '<div id="offline-signup-page">'. theme('offline_signup') .'</div>';
  return $output;
}

function theme_offline_signup_dependency_message($message) {
  return '<div id="offline-signup-dependency-message" class="js-hide messages error">'. $message .'</div>';
}

function theme_offline_signup_content() {
  $output = '<div id="offline-signup-content">';
  $output .= theme('offline_signup_content_signup');
  $output .= theme('offline_signup_content_settings');
  $output .= theme('offline_signup_content_sync');
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_content_signup() {
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/signup.js');

  $output = '<div id="offline-signup-content-signup">';
  $output .= drupal_get_form('offline_signup_user_router_form');
  $output .= drupal_get_form('offline_signup_user_register_form');
  $output .= drupal_get_form('offline_signup_user_update_form');
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_user_router_form($form) {
  return drupal_render($form);
}

function theme_offline_signup_user_register_form($form) {
  return drupal_render($form);
}

function theme_offline_signup_user_update_form($form) {
  return drupal_render($form);
}

function theme_offline_signup_content_settings() {
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/settings.js');

  $output = '<div id="offline-signup-content-settings">';
  $output .= drupal_get_form('offline_signup_settings_form');
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_content_sync() {
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/sync.js');

  // Because our page is able to be viewed while offline, we need to ensure
  // both the ASC and DESC images are loaded.
  $image = theme('tablesort_indicator', 'asc') . theme('tablesort_indicator', 'desc');

  // We generate link so we can control the sort via JavaScript and so the href
  // is simply '#sync'.
  $headers = array(
    '<a href="#sync">'. t('Name') . $image .'</a>',
    '<a href="#sync">'. t('E-mail') .'</a>',
    '<a href="#sync">'. t('Profile(s)') .'</a>',
    '<a href="#sync">'. t('Status') .'</a>'
  );
  // Add empty row.
  $rows = array(array('data' => array(array('data' => t('No users added to this event.'), 'class' => 'active', 'colspan' => 4)), 'class' => 'empty'));

  $output = '<div id="offline-signup-content-sync">';
  $output .= drupal_get_form('offline_signup_sync_form');
  $output .= theme('table', $headers, $rows);
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_menu_bar() {
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/menubar.js');
  drupal_add_js(array('offlineSignup' => array('menuTabs' => array('signup', 'settings', 'winners', 'sync'))), 'setting');

  $items = array(
    'signup' => array(
      'data' => '<a href="#signup" class="active">'. t('Sign-up') .'</a>',
      'class' => 'signup button active'
    ),
    'settings' => array(
      'data' => '<a href="#settings">'. t('Settings') .'</a>',
      'class' => 'settings button'
    ),
    'winners' => array(
      'data' => '<a href="#winners">'. t('Winners') .'</a>',
      'class' => 'winners button'
    ),
    'sync' => array(
      'data' => '<a href="#sync">'. t('Sync') .'</a>',
      'class' => 'sync button'
    )
  );
  return theme('item_list', $items, NULL, 'ul', array('id' => 'offline-signup-menu-bar', 'class' => 'links'));
}
