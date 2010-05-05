<?php
// $Id$

/*******************************************************************************
 * Callback Functions, Forms, and Tables
 ******************************************************************************/

function offline_signup_admin_form() {
  $empty_account = new stdClass();
  $categories = _user_categories($empty_account);
  $options = array(0 => t('None'));
  foreach ($categories as $category) {
    $options[$category['name']] = check_plain($category['title']);
  }
  $form['offline_signup_profile_category'] = array(
    '#type' => 'select',
    '#title' => t('Profile fields to include in offline sign-up form'),
    '#description' => t('Select the category that the profile fields should be used from. This pertains only to the Profile module. The only form elements that will be added to the offline sign-up form are profile fields from the selected category.'),
    '#default_value' => variable_get('offline_signup_profile_category', 'account'),
    '#options' => $options
  );
  return system_settings_form($form);
}
