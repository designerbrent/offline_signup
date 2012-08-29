<?php
// $Id$

/*******************************************************************************
 * Callback Functions, Forms, and Tables
 ******************************************************************************/

function offline_signup_admin_form() {
  $form['offline_signup_password'] = array(
    '#type' => 'textfield',
    '#title' => t('Password'),
    '#description' => t('Specify a password to authenticate with in order to gain access to the settings, drawings, and sync tabs. There is a 30 second grace period once leaving an authenticated tab before clearing the authentication.'),
    '#default_value' => variable_get('offline_signup_password', OFFLINE_SIGNUP_DEFAULT_PASSWORD)
  );

  $form['offline_signup_name_output'] = array(
    '#type' => 'textfield',
    '#title' => t('Name output'),
    '#description' => t("Specify the output that should be used for the user's names. Leave blank to just use the user's username.") .'<br />'. t("Use [{field_name}] (with {field_name} being the name of a field) as tokens for fields in the user object. Example: [name] will be replaced with the user's name."),
    '#default_value' => variable_get('offline_signup_name_output', '')
  );

  $empty_account = new stdClass();
  $categories = _user_categories($empty_account);
  $options = array(0 => t('None'));
  foreach ($categories as $category) {
    $options[$category['name']] = check_plain($category['title']);
  }
  $form['offline_signup_profile_category'] = array(
    '#type' => 'select',
    '#title' => t('Profile fields to include in offline sign-up form'),
    '#description' => t('Select the category that the profile fields should be called from. This pertains only to the Profile module. The only form elements that will be added to the offline sign-up form are profile fields from the selected category.'),
    '#default_value' => variable_get('offline_signup_profile_category', 'account'),
    '#options' => $options
  );

  $form['offline_signup_user_update_mail_message'] = array(
    '#type' => 'textarea',
    '#title' => t('User update mail message'),
    '#description' => t('The message sent to users to confirm the updates to their account via the Offline Sign-up page. Available variables are: !link.'),
    '#default_value' => variable_get('offline_signup_user_update_mail_message', OFFLINE_SIGNUP_USER_UPDATE_MESSAGE_DEFAULT),
    '#required' => TRUE
  );
  return system_settings_form($form);
}
