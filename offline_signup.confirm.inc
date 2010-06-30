<?php
// $Id$

/*******************************************************************************
 * Callback Functions, Forms, and Tables
 ******************************************************************************/

function offline_signup_update_confirm(&$form_state, $account, $updated, $hash) {
  // Validate timestamp hasn't expired.
  // Time out, in seconds until confirm URL expires. Six weeks.
  $timeout = 60*60*24*7*6;
  $current = time();
  if ($updated < $current && $account->status == 1) {
    if ($current - $updated > $timeout) {
      drupal_set_message(t('You have tried to use a link which has either been used or is no longer valid.'));
      // drupal_goto();
    }
    else if ($account->uid && $hash == md5($account->pass . $updated)) {
      // Verify the user has a pending update.
      $result = db_query("SELECT form_values FROM {offline_signup_user_updates} WHERE uid = %d AND updated = %d AND request_sent = %d", $account->uid, $updated, 1);
      if ($data = db_fetch_object($result)) {
        $form['update_values'] = array('#type' => 'value', '#value' => unserialize($data->form_values));
        $form['account'] = array('#type' => 'value', '#value' => $account);
        $form['updated'] = array('#type' => 'value', '#value' => $updated);
        $form['message'] = array('#value' => t('<p>You have used a link for %user_name and will expire on %expiration_date.</p><p>Click on the confirm button to apply the updates to your account or click on the cancel button to forgo them.</p>', array('%user_name' => $account->name, '%expiration_date' => format_date($updated + $timeout))));
        $form['confirm'] = array('#type' => 'submit', '#value' => t('Confirm'), '#validate' => array('offline_signup_update_confirm_validate'), '#submit' => array('offline_signup_update_confirm_submit'));
        $form['cancel'] = array('#type' => 'submit', '#value' => t('Cancel'), '#submit' => array('offline_signup_update_confirm_cancel'));
        // $form['#redirect'] = '';
        return $form;
      }
      else {
        drupal_not_found();
        exit();
      }
    }
    else {
      drupal_set_message(t('You have tried to use a link which has either been used or is no longer valid.'));
      // drupal_goto();
    }
  }
  else {
    drupal_not_found();
    exit();
  }
}

function offline_signup_update_confirm_validate($form, &$form_state) {
  if (module_exists('cp_plus')) {
    require_once drupal_get_path('module', 'node') .'/node.pages.inc';

    $form_state['content_profile'] = array();
    $types = content_profile_get_types('names');
    foreach ($types as $type => $name) {
      if ($form_state['update_values'][$type]) {
        if ($node = content_profile_load($type, $form_state['values']['account']->uid)) {
          $node = array_merge((array)$node, $form_state['values']['update_values']);
          $node = (object)$node;
          $status = 'updated';
        }
        else {
          $node = (object)$form_state['values']['update_values'];
          $node->type = $type;
          node_object_prepare($node);
          $status = 'new';
        }

        // Make sure there is no user name so we can node_validate.
        $node->name = '';

        if (!in_array('other', content_profile_get_settings($type, 'registration_hide'))) {
          node_validate($node);
        }
        elseif (module_exists('content')) {
          content_validate($node);
        }

        $form_state['content_profile'][$type] = array('node' => $node, 'status' => $status);
      }
    }
  }
}

function offline_signup_update_confirm_submit($form, &$form_state) {
  if (module_exists('profile')) {
    offline_signup_update_profile($form, $form_state);
  }

  if (module_exists('cp_plus')) {
    offline_signup_update_content_profile($form, $form_state);
  }

  if (module_exists('simplenews_register')) {
    offline_signup_update_simplenews($form, $form_state);
  }

  // db_query("DELETE FROM {offline_signup_user_updates} WHERE uid = %d AND updated = %d",
    // $form_state['values']['account']->uid, $form_state['values']['updated']);
  drupal_set_message(t('The updates have been applied.'));
  watchdog('offline_signup', 'User %name has applied their updates made at time %updated.', array('%name' => $form_state['values']['account']->name, '%updated' => $form_state['values']['updated']));
}

function offline_signup_update_confirm_cancel($form, &$form_state) {
  // db_query("DELETE FROM {offline_signup_user_updates} WHERE uid = %d AND updated = %d",
    // $form_state['values']['account']->uid, $form_state['values']['updated']);
  drupal_set_message(t('The updates have been canceled.'));
  watchdog('offline_signup', 'User %name has canceled their updates made at time %updated.', array('%name' => $form_state['values']['account']->name, '%updated' => $form_state['values']['updated']));
}

/*******************************************************************************
 * Module and Helper Functions
 ******************************************************************************/

function offline_signup_update_profile($form, &$form_state) {
  // Set register to TRUE since we only allow changes to fields that are available during register.
  profile_save_profile($form_state['values']['update_values'], $form_state['values']['account'], variable_get('offline_signup_profile_category', 'account'), TRUE);
}

function offline_signup_update_content_profile($form, &$form_state) {
  foreach ($form_state['content_profile'] as $type => $value) {
    $node = $value['node'];
    if (empty($node->title) && (!module_exists('auto_nodetitle') || auto_nodetitle_get_setting($type) != AUTO_NODETITLE_OPTIONAL)) {
      $node->title = $form_state['values']['account']->name;
    }
    $node->uid = $form_state['values']['account']->uid;
    $node->name = $form_state['values']['account']->name;

    // Create/update the node.
    $node = node_submit($node);
    node_save($node);
    // Give us a nice log message.
    if ($node->nid) {
      if ($value['status'] == 'new') {
        watchdog('offline_signup', 'Offline Sign-up: added %user %type via offline sign-up page.', array('%user' => $node->name, '%type' => $type), WATCHDOG_NOTICE, l(t('view'), "node/$node->nid"));
      }
      else {
        watchdog('offline_signup', 'Offline Sign-up: updated %user %type via offline sign-up page.', array('%user' => $node->name, '%type' => $type), WATCHDOG_NOTICE, l(t('view'), "node/$node->nid"));
      }
    }
  }
}

function offline_signup_update_simplenews($form, &$form_state) {
  simplenews_register_user('update', $form_state['values']['update_values'], $form_state['values']['account']);
}

function offline_signup_get_changes($account, $update_values) {
  $changes = array();
  // Get any changes to the user account. This also handles any changes to
  // core profile module.
  $changes = array_merge($changes, _offline_signup_get_account_changes($account, $update_values));

  if (module_exists('cp_plus')) {
    // Get any changes to the users content profiles.
    $changes = array_merge($changes, _offline_signup_get_content_profile_changes($account, $update_values));
  }

  if (module_exists('simplenews_register')) {
    // Get any changes to the users simplenews subscriptions.
    $changes = array_merge($changes, _offline_signup_get_simplenews_changes($account, $update_values));
  }
  return $changes;
}

function _offline_signup_get_account_changes($account, $update_values) {
  $fields = array();
  foreach (array_intersect_key((array)$account, $update_values) as $key => $value) {
    if ($update_values[$key] != $value) {
      $fields[$key] = $value;
    }
  }

  $changes = array();
  if (!empty($fields)) {
    module_load_include('inc', 'offline_signup', 'offline_signup.pages');

    $user_form = offline_signup_user_form();
    foreach ($fields as $key => $value) {
      if (isset($user_form[$key])) {
        $changes[] = t('!title: @value', array('!title' => filter_xss_admin($user_form[$key]['#title']), '@value' => $value));
      }
      // Profile module stores their elements in a parent element of the
      // selected category.
      else if (isset($user_form[variable_get('offline_signup_profile_category', 'account')][$key])) {
        $category = variable_get('offline_signup_profile_category', 'account');
        $changes[] = t('!title: %value', array('!title' => filter_xss_admin($user_form[$category][$key]['#title']), '%value' => $value));
      }
    }
  }
  return $changes;
}

/**
 * TODO
 * CCK fields that allow multiple values need to render correctly. Currently
 * the values are truncated into a single string. Preferably they should be
 * made into children arrays.
 */
function _offline_signup_get_content_profile_changes($account, $update_values) {
  $changes = array();
  $fields = array();
  $types = content_profile_get_types('names');
  foreach ($types as $type => $name) {
    if (isset($update_values[$type]) && $update_values[$type]) {
      $profile = content_profile_load($type, $account->uid);
      if (!$profile) {
        // A profile does not exist. We create an empty stdClass, then every
        // value will be interpretted as changed.
        $changes[] = t('!title: %value', array('!title' => filter_xss_admin($name), '%value' => t('New profile')));
        continue;
      }

      $fields[$type] = array();
      foreach (array_intersect_key((array)$profile, $update_values) as $key => $value) {
        if ($key == 'name' || _offline_signup_determine_value($value) == _offline_signup_determine_value($update_values[$key])) {
          continue;
        }

        // TODO This should not be converted to string if an array.
        $fields[$type][$key] = _offline_signup_determine_value($value);
      }
    }
  }

  if (!empty($fields)) {
    // Render out each fields string output.
    foreach ($fields as $type => $values) {
      $children = array();
      foreach ($values as $k => $v) {
        $children[] = t('!title: %value', array('!title' => filter_xss_admin($k), '%value' => $v));
      }
      $changes[] = array(
        'data' => t('!title: Updated profile', array('!title' => filter_xss_admin($types[$type]))),
        'children' => $children
      );
    }
  }

  return $changes;
}

function _offline_signup_get_simplenews_changes($account, $update_values) {
  $changes = array();
  foreach (taxonomy_get_tree(_simplenews_get_vid()) as $term) {
    if (variable_get('simplenews_register_'. $term->tid .'_show', TRUE) && (isset($update_values['simplenews-'. $term->tid]) && $update_values['simplenews-'. $term->tid]) && !simplenews_user_is_subscribed($account->mail, $term->tid)) {
      $changes[] = t('!name: Subscribe', array('!name' => $term->name));
    }
  }
  return $changes;
}

function _offline_signup_determine_value($value, $string = '') {
  if (is_array($value)) {
    foreach ($value as $k => $v) {
      $string .= _offline_signup_determine_value($v, $string);
    }
    return $string;
  }

  $string .= $value;
  return $string;
}

/*******************************************************************************
 * Theme Functions
 ******************************************************************************/

function theme_offline_signup_update_confirm($form) {
  $changes = offline_signup_get_changes($form['account']['#value'], $form['update_values']['#value']);

  $output = drupal_render($form['message']);
  $output .= theme('item_list', $changes);
  $output .= drupal_render($form);
  return $output;
}
