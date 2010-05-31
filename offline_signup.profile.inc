<?php
// $Id$

/*******************************************************************************
 * Module and Helper Functions
 ******************************************************************************/

function offline_signup_profile_types_form() {
  $form['offline_signup_profiles'] = array(
    '#type' => 'fieldset',
    '#title' => t('Profiles'),
    '#description' => t('Select which profiles to create.'),
    '#collapsible' => FALSE,
    '#weight' => 5
  );

  $types = content_profile_get_types();
  foreach ($types as $type) {
    $form['offline_signup_profiles'][$type->type] = array(
      '#type' => 'checkbox',
      '#title' => check_plain($type->name),
      '#description' => filter_xss_admin($type->description),
      '#attributes' => array('class' => 'profile-type')
    );
  }
  return $form;
}
