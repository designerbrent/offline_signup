// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};

Drupal.behaviors.offlineSignupSync = function() {
  if ($('#offline-signup-content-sync:not(.offline-signup-sync-processed)').size()) {
    $('#offline-signup-content-sync table.sticky-enabled thead th:first').addClass('active').children('a').addClass('active');
    Drupal.OfflineSignup.imgASC = $('#offline-signup-content-sync table.sticky-enabled thead th a img:first');
    Drupal.OfflineSignup.imgDESC = $('#offline-signup-content-sync table.sticky-enabled thead th a img:last').remove();

    Drupal.OfflineSignup.activeHeader = $('#offline-signup-content-sync table.sticky-enabled thead th:first a').data('sort', 'asc');

    // Apply click events to table headers.
    $('#offline-signup-content-sync table.sticky-enabled thead th').each(function() {
      $(this).click(function() {
        var sort = 'asc';
        if ($('img', $(this)).size()) {
          // Determine the sort direction.
          sort = (Drupal.OfflineSignup.activeHeader.data('sort') != 'asc') ? 'asc' : 'desc';
          var img = (sort == 'asc') ? Drupal.OfflineSignup.imgASC : Drupal.OfflineSignup.imgDESC;
          $('img', $(this)).replaceWith(img);
        }
        else {
          // Since no img yet exists, we default sort to ASC and remove the img
          // from the activeHeader.
          $('img', Drupal.OfflineSignup.activeHeader).remove();
          $(this).append(Drupal.OfflineSignup.imgASC);
        }
        // Set this header to activeHeader.
        Drupal.OfflineSignup.activeHeader = $(this).data('sort', sort);
        return false;
      });
    });

    $('#offline-signup-content-sync').addClass('offline-signup-sync-processed');
  }
}
