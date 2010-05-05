// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};

Drupal.behaviors.offlineSignupSettings = function() {
  if ($('#offline-signup-content-settings:not(.offline-signup-settings-processed)').size()) {
    

    $('#offline-signup-content-settings').addClass('offline-signup-settings-processed');
  }
}
