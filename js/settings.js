// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};
Drupal.OfflineSignup.settings = {
  location: '',
  drawings: 0
};

Drupal.behaviors.offlineSignupSettings = function() {
  if ($('#offline-signup-settings-form:not(.offline-signup-settings-processed)').size() && window.localStorage) {
    $settingsForm = $('#offline-signup-settings-form');

    if (settings = localStorage.getItem('offlineSignupSettings')) {
      settings = Drupal.parseJson(settings);
      $.extend(Drupal.OfflineSignup.settings, settings);
    }

    $('input[name=save]', $settingsForm).click(function() {
      Drupal.OfflineSignup.settings.location = $('input[name=location]', $settingsForm).val();
      Drupal.OfflineSignup.settings.drawings = $('select[name=drawings]', $settingsForm).val();
      localStorage.setItem('offlineSignupSettings', Drupal.OfflineSignup.toJson(Drupal.OfflineSignup.settings));
      return false;
    });

    $('input[name=location]', $settingsForm).val(Drupal.OfflineSignup.settings.location);
    $('select[name=drawings]', $settingsForm).val(Drupal.OfflineSignup.settings.drawings);

    $('#offline-signup-settings-form').addClass('offline-signup-settings-processed');
  }
}
