<?php
// $Id$

/*******************************************************************************
 * Callback Functions, Forms, and Tables
 ******************************************************************************/

function offline_signup_ajax_settings() {
  require_once drupal_get_path('module', 'offline_signup') .'/offline_signup.pages.inc';

  $form_state = array('storage' => NULL, 'submitted' => FALSE);
  $form_build_id = $_POST['form_build_id'];

  // Get the form from the Form API cache.
  $form = form_get_cache($form_build_id, $form_state);
  $args = $form['#parameters'];
  $form_id = array_shift($args);

  $form_state['post'] = $form['#post'] = $_POST;

  $form['#programmed'] = TRUE;
  $form['#redirect'] = FALSE;

  drupal_process_form($form_id, $form, $form_state);

  if ($errors = form_get_errors()) {
    if (is_array($errors)) {
      $message = array();
      foreach ($errors as $error) {
        $message[] = check_plain($error);
      }
      $message = implode("\n", $message);
    }
    else {
      $message = check_plain($errors);
    }
    print drupal_json(array('status' => FALSE, 'message' => $message));
  }
  else {
    print drupal_json(array('status' => TRUE, 'message' => t('Settings saved!')));
  }

  // Clear out messages.
  theme('status_messages');
  exit();
}

function offline_signup_ajax_sync_user() {
  module_load_include('inc', 'offline_signup', 'offline_signup.pages');

  $form_state = array();
  $form_state['values'] = $_POST;
  foreach (array('status', 'source', 'form_build_id', 'form_id', 'form_token') as $key) {
    unset($form_state['values'][$key]);
  }

  switch ($_POST['status']) {
    case 'new':
      $form_state['values'] += array(
        // Notify the user of the new account.
        'notify' => TRUE,
        // Generate a password.
        'pass' => user_password()
      );
      $form_state['values']['op'] = t('Create new account');
      drupal_execute('user_register', $form_state);
      break;
    case 'updated':
      $form_state['values']['op'] = t('Update account');
      drupal_execute('offline_signup_user_update_form', $form_state);
      break;
  }

  // No need to call exit() since offline_signup_ajax_response() does it for
  // us.
  offline_signup_ajax_response();
}

function offline_signup_ajax_sync_drawing() {
  $form_state = array();
  $form_state['values'] = $_POST;
  foreach (array('form_build_id', 'form_id', 'form_token') as $key) {
    unset($form_state['values'][$key]);
  }

  $form_state['values']['op'] = t('Save drawing');
  drupal_execute('offline_signup_drawing_form', $form_state);

  // No need to call exit() since offline_signup_ajax_response() does it for
  // us.
  offline_signup_ajax_response();
}

function offline_signup_ajax_response() {
  $response = array('status' => TRUE);

  if ($errors = form_get_errors()) {
    $response['status'] = 'error';
    if (is_array($errors)) {
      $errors = implode("\n", $errors);
    }
    $response['error'] = $errors;
  }
  else {
    
  }

  if ($messages = theme('status_messages')) {
    $response['messages'] = $messages;
  }

  print drupal_json($response);
  exit();
}

function offline_signup_user_update_form() {
  $form['event'] = array(
    '#type' => 'value'
  );
  $form['user'] = array(
    '#type' => 'value',
    '#value' => NULL
  );
  $form['mail'] = array(
    '#type' => 'textfield',
    '#title' => t('E-mail address'),
    '#maxlength' => EMAIL_MAX_LENGTH,
    '#description' => t('A valid e-mail address. All e-mails from the system will be sent to this address. The e-mail address is not made public and will only be used if you wish to receive a new password or wish to receive certain news or notifications by e-mail.'),
    '#required' => TRUE
  );
  $form['post'] = array(
    '#type' => 'value',
    '#value' => array_diff_key($_POST, array_flip(array('form_build_id', 'form_token', 'form_id', 'save', 'changed', 'event', 'status')))
  );

  $form['update'] = array(
    '#type' => 'submit',
    '#value' => t('Update account'),
    '#name' => 'update'
  );

  return $form;
}

function offline_signup_user_update_form_validate($form, &$form_state) {
  if ($account = user_load(array('mail' => $form_state['values']['mail']))) {
    form_set_value($form['user'], $account, $form_state);
  }
  else {
    form_set_error('mail', t('User account could not be loaded.'));
  }
}

function offline_signup_user_update_form_submit($form, &$form_state) {
  $form_values = $form_state['values'];
  unset($form_values['user']);

  // Delete any pending updates before saving new one.
  db_query("DELETE FROM {offline_signup_user_updates} WHERE uid = %d", $form_state['values']['user']->uid);

  db_query("INSERT INTO {offline_signup_user_updates} (uid, form_values, updated) VALUES (%d, '%s', %d)",
    $form_state['values']['user']->uid, serialize($form_state['values']['post']), time());

  db_query("INSERT INTO {offline_signup_event_users} (uid, event) VALUES (%d, '%s')",
    $form_state['values']['user']->uid, $form_state['values']['event']);
}
