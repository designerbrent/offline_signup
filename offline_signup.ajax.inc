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
