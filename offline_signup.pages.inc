<?php
// $Id$

/*******************************************************************************
 * Callback Functions, Forms, and Tables
 ******************************************************************************/

function offline_signup_user_form() {
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

  if (module_exists('cp_plus')) {
    module_load_include('inc', 'offline_signup', 'offline_signup.profile');

    $form += offline_signup_profile_types_form();
  }

  if (module_exists('simplenews_register')) {
    $edit = $account = array();
    $form += simplenews_register_user('register', $edit, $account);
  }

  $form['buttons'] = array('#weight' => 10);
  $form['buttons']['save'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
    '#name' => 'save'
  );

  return $form;
}

function offline_signup_settings_form() {
  $form['#action'] = url('offline_signup/ajax/settings');
  $form['#cache'] = TRUE;
  $form['information'] = array(
    '#type' => 'fieldset',
    '#title' => t('Event information')
  );
  $form['information']['title'] = array(
    '#type' => 'textfield',
    '#title' => t('Title'),
    '#default_value' => variable_get('offline_signup_title', t('Offline sign-up')),
    '#required' => TRUE
  );
  $form['information']['event'] = array(
    '#type' => 'textfield',
    '#title' => t('Event'),
    '#default_value' => variable_get('offline_signup_event', ''),
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
  $form['development'] = array(
    '#type' => 'fieldset',
    '#title' => t('Development'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE
  );
  $form['development']['random'] = array(
    '#type' => 'checkbox',
    '#title' => t('Random link'),
    '#description' => t('When enabled, a link will be available on the sign-up tab for randomly generating values for the form.')
  );
  $form['save'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
    '#name' => 'save'
  );
  return $form;
}

function offline_signup_settings_form_submit($form, &$form_state) {
  variable_set('offline_signup_title', $form_state['values']['title']);
  variable_set('offline_signup_event', $form_state['values']['event']);
}

function offline_signup_drawings_form() {
  $form['fieldset'] = array(
    '#type' => 'fieldset',
    '#title' => t('Drawing 1'),
    '#theme' => 'offline_signup_drawings_form_fieldset'
  );
  $form['fieldset']['select_winner'] = array(
    '#type' => 'button',
    '#value' => t('Select a Winner Now'),
    '#name' => 'select_winner'
  );
  $form['fieldset']['name'] = array(
    '#type' => 'item',
    '#title' => t('Name'),
    '#value' => ''
  );
  $form['fieldset']['mail'] = array(
    '#type' => 'item',
    '#title' => t('E-mail'),
    '#value' => ''
  );
  $form['fieldset']['date'] = array(
    '#type' => 'item',
    '#title' => t('Selected'),
    '#value' => ''
  );
  $form['fieldset']['select_another'] = array(
    '#type' => 'button',
    '#value' => t('Select another'),
    '#name' => 'select_another'
  );
  $form['fieldset']['keep_winner'] = array(
    '#type' => 'submit',
    '#value' => t('Keep this one'),
    '#name' => 'keep_winner'
  );
  $form['fieldset']['cancel'] = array(
    '#type' => 'button',
    '#value' => t('Cancel'),
    '#name' => 'cancel'
  );
  return $form;
}

function offline_signup_sync_form() {
  $form['#action'] = url('offline_signup/ajax/sync');
  $form['#cache'] = TRUE;
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
  drupal_set_title(check_plain(variable_get('offline_signup_title', t('Offline sign-up'))));

  drupal_add_css(drupal_get_path('module', 'offline_signup') .'/offline_signup.css');
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/offline_signup.js');
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/profiles.js');
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/json2.js');

  drupal_add_js('misc/jquery.form.js', 'core');

  // Add the password so JavaScript can validate.
  drupal_add_js(array('offlineSignup' => array('password' => variable_get('offline_signup_password', OFFLINE_SIGNUP_DEFAULT_PASSWORD))), 'setting');

  $result = db_query("SELECT name, mail FROM {users} WHERE uid > 0");
  $emails = array();
  while ($data = db_fetch_object($result)) {
    $emails[$data->name] = $data->mail;
  }
  drupal_add_js(array('offlineSignup' => array('emails' => $emails)), 'setting');

  if ($event = variable_get('offline_signup_event', '')) {
    // Grab information for existing users based on the active event.
    $users = array();
    $result = db_query("SELECT u.uid, u.mail, u.name FROM {users} AS u INNER JOIN {offline_signup_event_users} AS eu ON u.uid = eu.uid AND eu.event = '%s'", $event);
    while ($data = db_fetch_object($result)) {
      if (variable_get('offline_signup_name_output', '') != '' && module_exists('profile')) {
        $account = new stdClass();
        $account->uid = $data->uid;
        $account->mail = $data->mail;
        $account->name = $data->name;
        profile_load_profile($account);
        unset($account->uid);
        $user_array = (array)$account;
      }
      else {
        $user_array = array('mail' => $data->mail, 'name' => $data->name);
      }
      $users[$account->mail] = $user_array + array(
        'source' => 'server',
        'status' => '',
        'static' => TRUE
      );
    }
    drupal_add_js(array('offlineSignup' => array('users' => $users)), 'setting');

    // Grab any finalized drawings held for this event.
    $drawings = array();
    $result = db_query("SELECT * FROM {offline_signup_drawings} WHERE event = '%s' ORDER BY number ASC", $event);
    while ($data = db_fetch_object($result)) {
      $drawings[] = array(
        'id' => $data->number,
        'event' => $data->event,
        'mail' => $data->mail,
        'date' => $data->selected * 1000,
        'state' => 3,
        'saved' => TRUE
      );
    }
    if (!empty($drawings)) {
      drupal_add_js(array('offlineSignup' => array('drawings' => $drawings)), 'setting');
    }
  }

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
  $output .= theme('offline_signup_content_drawings');
  $output .= theme('offline_signup_content_sync');
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_menu_bar() {
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/menubar.js');
  drupal_add_js(array('offlineSignup' => array('menuTabs' => array('signup', 'settings', 'drawings', 'sync'), 'menuSecureTabs' => array('settings', 'drawings', 'sync'))), 'setting');

  $items = array(
    'signup' => array(
      'data' => '<a href="#signup" class="active">'. t('Sign-up') .'</a>',
      'class' => 'signup button active'
    ),
    'settings' => array(
      'data' => '<a href="#settings">'. t('Settings') .'</a>',
      'class' => 'settings button'
    ),
    'drawings' => array(
      'data' => '<a href="#drawings">'. t('Drawings') .'</a>',
      'class' => 'drawings button'
    ),
    'sync' => array(
      'data' => '<a href="#sync">'. t('Sync') .'</a>',
      'class' => 'sync button'
    )
  );
  return theme('item_list', $items, NULL, 'ul', array('id' => 'offline-signup-menu-bar', 'class' => 'links'));
}

function theme_offline_signup_content_signup() {
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/signup.js');

  $output = '<div id="offline-signup-content-signup">';
  $output .= drupal_get_form('offline_signup_user_form');
  $output .= theme('offline_signup_profiles');
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_user_form($form) {
  return drupal_render($form);
}

function theme_offline_signup_profiles() {
  module_load_include('inc', 'node', 'node.pages');

  $types = content_profile_get_types('names');

  drupal_add_js(array('offlineSignup' => array('profiles' => $types)), 'setting');

  $output = '';
  foreach ($types as $type => $name) {
    $output .= '<div id="'. $type .'-node-form-wrapper" class="node-form-wrapper">'. drupal_render(offline_signup_add_profile_form($type)) .'</div>';
  }
  return $output;
}

function theme_offline_signup_content_settings() {
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/settings.js');

  $output = '<div id="offline-signup-content-settings">';
  $output .= drupal_get_form('offline_signup_settings_form');
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_content_drawings() {
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/drawings.js');

  $output = '<div id="offline-signup-content-drawings">';
  $output .= drupal_get_form('offline_signup_drawings_form');
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_drawings_form_fieldset($form) {
  $output = '<div class="drawing-state-1">'. drupal_render($form['select_winner']) .'</div>';
  $output .= '<div class="drawing-state-2 drawing-state-3">';
  $output .= drupal_render($form['name']) . drupal_render($form['mail']) . drupal_render($form['date']);
  $output .= '</div>';
  $output .= '<div class="drawing-state-2">';
  $output .= drupal_render($form['select_another']) . drupal_render($form['keep_winner']) . drupal_render($form['cancel']);
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_content_sync() {
  drupal_add_js(drupal_get_path('module', 'offline_signup') .'/js/sync.js');
  drupal_add_js(array('offlineSignup' => array('nameOutput' => variable_get('offline_signup_name_output', ''))), 'setting');

  $output = '<div id="offline-signup-content-sync">';
  $output .= drupal_get_form('offline_signup_sync_form');
  $output .= theme('offline_signup_sync_users_table');
  $output .= theme('offline_signup_sync_drawings_table');
  $output .= '</div>';
  return $output;
}

function theme_offline_signup_sync_users_table() {
  // Because our page is able to be viewed while offline, we need to ensure
  // both the ASC and DESC images get loaded.
  $image = theme('tablesort_indicator', 'asc') . theme('tablesort_indicator', 'desc');

  // We generate link so we can control the sort via JavaScript and so the href
  // is simply '#sync'.
  $headers = array(
    array('data' => '', 'class' => 'ajax-status'),
    array('data' => '<a href="#sync">'. t('Name') . $image .'</a>', 'class' => 'name'),
    array('data' => '<a href="#sync">'. t('E-mail') .'</a>', 'class' => 'mail'),
    array('data' => '<a href="#sync">'. t('Profile(s)') .'</a>', 'class' => 'profiles'),
    array('data' => '<a href="#sync">'. t('Source') .'</a>', 'class' => 'source'),
    array('data' => '<a href="#sync">'. t('Status') .'</a>', 'class' => 'status'),
    array('data' => t('Actions'), 'class' => 'actions')
  );
  // Add empty row.
  $rows = array(array('data' => array(array('data' => t('No users added to this event.'), 'class' => 'active', 'colspan' => 7)), 'class' => 'empty'));
  return theme('table', $headers, $rows, array('id' => 'offline-signup-sync-users-table'));
}

function theme_offline_signup_sync_drawings_table() {
  // Because our page is able to be viewed while offline, we need to ensure
  // both the ASC and DESC images get loaded.
  $image = theme('tablesort_indicator', 'asc') . theme('tablesort_indicator', 'desc');

  // We generate link so we can control the sort via JavaScript and so the href
  // is simply '#sync'.
  $headers = array(
    array('data' => '', 'class' => 'ajax-status'),
    array('data' => '<a href="#sync">'. t('Drawing') . $image .'</a>', 'class' => 'number'),
    array('data' => '<a href="#sync">'. t('Name') .'</a>', 'class' => 'name'),
    array('data' => '<a href="#sync">'. t('E-mail') .'</a>', 'class' => 'mail'),
    array('data' => '<a href="#sync">'. t('Date selected') .'</a>', 'class' => 'date')
  );
  // Add empty row.
  $rows = array(array('data' => array(array('data' => t('No drawings yet completed.'), 'class' => 'active', 'colspan' => 5)), 'class' => 'empty'));
  return theme('table', $headers, $rows, array('id' => 'offline-signup-sync-drawings-table'));
}
