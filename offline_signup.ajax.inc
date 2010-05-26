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
  $form_state = array('storage' => NULL, 'submitted' => FALSE);
  $form_build_id = $_POST['form_build_id'];
  $form = form_get_cache($form_build_id, $form_state);

  $args = $form['#parameters'];
  $form_id = array_shift($args);
  $form_state['post'] = $form['#post'] = $_POST;
  $form['#programmed'] = $form['#redirect'] = FALSE;

  drupal_process_form($form_id, $form, $form_state);
  $form = drupal_rebuild_form($form_id, $form_state, $args, $form_build_id);

  print drupal_json(array('status' => TRUE, 'data' => array()));
  exit();
}
