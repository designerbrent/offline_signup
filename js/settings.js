// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};
Drupal.OfflineSignup.settings = {
  event: '',
  drawings: 0
};

Drupal.behaviors.offlineSignupSettings = function() {
  if ($('#offline-signup-settings-form:not(.offline-signup-settings-processed)').size() && window.localStorage) {
    $settingsForm = $('#offline-signup-settings-form');

    if (settings = localStorage.getItem('offlineSignupSettings')) {
      settings = Drupal.parseJson(settings);
      $.extend(Drupal.OfflineSignup.settings, settings);
    }

    // Disable tabs if an event has not been set.
    if (!Drupal.OfflineSignup.settings.event) {
      if (Drupal.OfflineSignup.menuBar) {
        Drupal.OfflineSignup.menuBar.disableTabs('settings');
      }
    }

    $('input[name=save]', $settingsForm).click(function() {
      if ($('input[name=event]', $settingsForm).val()) {
        $settingsForm.ajaxSubmit({
          success: function(responseText, status) {
            if (responseText.status == true) {
              Drupal.OfflineSignup.settings.event = $('input[name=event]', $settingsForm).val();

              // Enable tabs.
              if (Drupal.OfflineSignup.menuBar) {
                Drupal.OfflineSignup.menuBar.enableTabs('settings');
              }
            }
            alert(responseText.message);
            // We want to redirect to the signup form.
            window.location = Drupal.settings.basePath + 'offline/signup#signup';
            // Due to the page doesn't actually reload because we supplied a
            // fragment, we force a reload. This will effectively load all
            // pre-existing user's data that were created via the set event.
            window.location.reload();
          },
          complete: function(response, status) {
            if (status != 'success' && Drupal.OfflineSignup.settings.event == '') {
              alert(Drupal.t('There was a problem connecting to the server. Settings were not saved.'));
            }
          },
          dataType: 'json',
          type: 'POST'
        });

        // Save changes to the number of drawings.
        // Save settings.
        Drupal.OfflineSignup.settings.drawings = $('select[name=drawings]', $settingsForm).val();
        localStorage.setItem('offlineSignupSettings', Drupal.OfflineSignup.toJson(Drupal.OfflineSignup.settings));
      }
      else {
        alert(Drupal.t('Please enter an event.'));
      }
      return false;
    });

    $('input[name=event]', $settingsForm).val(Drupal.OfflineSignup.settings.event);
    $('select[name=drawings]', $settingsForm).val(Drupal.OfflineSignup.settings.drawings);

    $('#offline-signup-settings-form').addClass('offline-signup-settings-processed');
  }
}
