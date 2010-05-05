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

  // Wrapper around the user register form elements so they can be hidden
  // until a JavaScript check is performed on the mail field to determine if
  // the given email address is already taken..
  $form['user_register'] = array();

  if (module_exists('profile')) {
    $form['user_register'] += profile_form_profile($form, NULL, variable_get('offline_signup_profile_category', 'account'), TRUE);
  }

  $form['user_register']['offline_signup_profiles'] = array(
    '#type' => 'fieldset',
    '#title' => t('Profiles'),
    '#description' => t('Select which profiles to create.'),
    '#collapsible' => FALSE,
    '#weight' => 5
  );
  $types = content_profile_get_types();
  foreach ($types as $type) {
    $form['user_register']['offline_signup_profiles'][$type->type] = array(
      '#type' => 'checkbox',
      '#title' => check_plain($type->name),
      '#description' => filter_xss_admin($type->description)
    );
  }

  $form['user_register']['buttons'] = array('#weight' => 10);
  $form['user_register']['buttons']['back'] = array(
    '#type' => 'button',
    '#value' => t('Back')
  );
  $form['user_register']['buttons']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Create new account')
  );

  return $form;
}

function offline_signup_admin_form() {
  
}

function offline_signup_sync_form() {
  
}

function offline_signup_winners_page() {
  
}

/*******************************************************************************
 * Theme Functions
 ******************************************************************************/

function template_preprocess_offline_signup(&$vars) {
  $vars['content'] = theme('offline_signup_content');
  $vars['menu_bar'] = theme('offline_signup_menu_bar');
}

function theme_offline_signup_page() {
  drupal_add_css(drupal_get_path('module', 'offline_signup') .'/offline_signup.css');
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/offline_signup.js');

  $result = db_query("SELECT uid, mail FROM {users} WHERE uid > 0");
  $users = array();
  while ($data = db_fetch_object($result)) {
    $users[$data->uid] = $data->mail;
  }
  drupal_add_js(array('offlineSignup' => array('users' => $users)), 'setting');

  $message = '<p>'. t('This page is dependent on JavaScript.') .'</p>';
  $output = theme('offline_signup_dependency_message', $message);
  $output .= '<div id="offline-signup-page">'. theme('offline_signup') .'</div>';
  return $output;
}

function theme_offline_signup_dependency_message($message) {
  return '<div id="offline-signup-dependency-message" class="js-hide">'. $message .'</div>';
}

function theme_offline_signup_content() {
  $output = '<div id="offline-signup-content">';
  $output .= theme('offline_signup_content_signup');
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_content_signup() {
  $output = '<div id="offline-signup-content-signup">';
  $output .= drupal_get_form('offline_signup_user_router_form');
  $output .= drupal_get_form('offline_signup_user_register_form');
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_menu_bar() {
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/menubar.js');
  drupal_add_js(array('offlineSignup' => array('menuTabs' => array('signup', 'settings', 'winners', 'sync'))), 'setting');

  $items = array(
    'signup' => array(
      'data' => '<a href="#signup" class="active">'. t('Sign-up form') .'</a>',
      'class' => 'signup active'
    ),
    'settings' => array(
      'data' => '<a href="#settings">'. t('Settings') .'</a>',
      'class' => 'settings'
    ),
    'winners' => array(
      'data' => '<a href="#winners">'. t('Winners') .'</a>',
      'class' => 'winners'
    ),
    'sync' => array(
      'data' => '<a href="#sync">'. t('Sync') .'</a>',
      'class' => 'sync'
    )
  );
  return theme('item_list', $items, NULL, 'ul', array('class' => 'offline-signup-menu-bar links'));
}
