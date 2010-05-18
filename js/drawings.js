// $Id$

Drupal.behaviors.offlineSignupDrawings = function() {
  if ($('#offline-signup-content-drawings:not(.offline-signup-content-processed)').size()) {
    

    $('#offline-signup-content-drawings').addClass('offline-signup-content-processed');
  }
}
