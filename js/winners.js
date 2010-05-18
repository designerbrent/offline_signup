// $Id$

Drupal.behaviors.offlineSignupWinners = function() {
  if ($('#offline-signup-content-winners:not(.offline-signup-content-processed)').size()) {
    

    $('#offline-signup-content-winners').addClass('offline-signup-content-processed');
  }
}
