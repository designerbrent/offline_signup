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

    // Disable tabs if a location has not been set.
    if (!Drupal.OfflineSignup.settings.location) {
      if (Drupal.OfflineSignup.menuBar) {
        Drupal.OfflineSignup.menuBar.disableTabs('settings');
      }
    }

    $('input[name=save]', $settingsForm).click(function() {
      if ($('input[name=location]', $settingsForm).val()) {
        Drupal.OfflineSignup.settings.location = $('input[name=location]', $settingsForm).val();
        Drupal.OfflineSignup.settings.drawings = $('select[name=drawings]', $settingsForm).val();
        localStorage.setItem('offlineSignupSettings', Drupal.OfflineSignup.toJson(Drupal.OfflineSignup.settings));

        // Enable tabs.
        if (Drupal.OfflineSignup.menuBar) {
          Drupal.OfflineSignup.menuBar.enableTabs('settings');
        }
      }
      else {
        alert(Drupal.t('Please enter a location.'));
      }
      return false;
    });

    $('input[name=location]', $settingsForm).val(Drupal.OfflineSignup.settings.location);
    $('select[name=drawings]', $settingsForm).val(Drupal.OfflineSignup.settings.drawings);

    $('#offline-signup-settings-form').addClass('offline-signup-settings-processed');
  }
}
