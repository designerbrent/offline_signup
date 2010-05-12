// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};

Drupal.behaviors.offlineSignupSync = function() {
  if ($('#offline-signup-content-sync:not(.offline-signup-sync-processed)').size()) {
    // Store the ASC and DESC images and remove the DESC from displaying by default.
    Drupal.OfflineSignup.imgASC = $('#offline-signup-content-sync table.sticky-enabled thead th a img:first');
    Drupal.OfflineSignup.imgDESC = $('#offline-signup-content-sync table.sticky-enabled thead th a img:last').remove();

    // Set the default activeHeader.
    $('#offline-signup-content-sync table.sticky-enabled thead th:first').addClass('active').children('a').addClass('active');
    Drupal.OfflineSignup.activeHeader = $('#offline-signup-content-sync table.sticky-enabled thead th:first a').data('sort', 'asc');

    // Apply click events to table headers.
    $('#offline-signup-content-sync table.sticky-enabled thead th').each(function() {
      var $header = $(this);
      $('a', $(this)).click(function() {
        var sort = 'asc';
        var index = $('#offline-signup-content-sync table.sticky-enabled th').index($header);
        if ($('img', $header).size()) {
          // Determine the sort direction.
          sort = (Drupal.OfflineSignup.activeHeader.data('sort') != 'asc') ? 'asc' : 'desc';
          var img = (sort == 'asc') ? Drupal.OfflineSignup.imgASC : Drupal.OfflineSignup.imgDESC;
          $('img', $header).replaceWith(img);
        }
        else {
          // Since no img yet exists, we default sort to ASC and remove the img
          // from the activeHeader.
          $('img', Drupal.OfflineSignup.activeHeader).remove();
          $header.append(Drupal.OfflineSignup.imgASC);
        }
        // Set this header to activeHeader.
        Drupal.OfflineSignup.activeHeader = $header.data('sort', sort);
        Drupal.OfflineSignup.sortTable(index, sort);
        return false;
      });
    });

    // When tab is active, we need to (re)populate the table rows for all local
    // users. Override the default focus method with our own.
    Drupal.OfflineSignup.menuBar.tabs['sync'].focus = function(animate) {
      // Before we reveal the sync page, we first (re)populate the table with
      // users if there are any.
      var length = 0;
      for (var i in Drupal.OfflineSignup.users) length++;
      if (length > 0) {
        // Users exist locally clear and populate table.
        $table = $('#offline-signup-content-sync table.sticky-enabled');
        $('tbody tr', $table).remove();
        for (var i in Drupal.OfflineSignup.users) {
          var user = Drupal.OfflineSignup.users[i];
          var row = $('<tr>');
          $(row).append('<td>' + Drupal.checkPlain(user.name) + '</td>');
          $(row).append('<td>' + Drupal.checkPlain(user.mail) + '</td>');
          $(row).append('<td>TODO</td>');
          $(row).append('<td>' + Drupal.checkPlain(user.status) + '</td>');
          $('tbody', $table).append($(row));
        }
        $header = Drupal.OfflineSignup.activeHeader;
        Drupal.OfflineSignup.sortTable($('#offline-signup-content-sync table.sticky-enabled th').index($header), $header.data('sort'));
      }

      $(this.element).addClass('active').parent().addClass('active');
      if (animate) {
        $('#offline-signup-content-' + this.type).slideDown('fast');
      }
      else {
        $('#offline-signup-content-' + this.type).show();
      }
    }

    $('#offline-signup-content-sync').addClass('offline-signup-sync-processed');
  }
}

Drupal.OfflineSignup.sortTable = function(column, sort) {
  var $table = $('#offline-signup-content-sync table.sticky-enabled');
  var rows = $table.find('tbody > tr').get();
  rows.sort(function(a, b) {
    var keyA = $(a).children('td').eq(column).text().toUpperCase();
    var keyB = $(b).children('td').eq(column).text().toUpperCase();

    if (keyA < keyB) return (sort == 'asc') ? -1 : 1;
    if (keyA > keyB) return (sort == 'asc') ? 1 : -1;
    return 0;
  });

  $.each(rows, function(index, row) {
    $table.children('tbody').append(row);
  });

  $('tbody tr:odd', $table).removeClass('even').addClass('odd');
  $('tbody tr:even', $table).removeClass('odd').addClass('even');
}
