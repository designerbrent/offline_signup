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
      if ($('a', $(this)).size()) {
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
      }
    });

    // When tab is active, we need to (re)populate the table rows for all local
    // users. Override the default focus method with our own.
    Drupal.OfflineSignup.menuBar.tabs['sync'].focus = function(animate) {
      // Before we reveal the sync page, we first (re)populate the table with
      // users if there are any.
      Drupal.OfflineSignup.updateTable();

      $(this.element).addClass('active').parent().addClass('active');
      if (animate) {
        $('#offline-signup-content-' + this.type).slideDown('fast');
      }
      else {
        $('#offline-signup-content-' + this.type).show();
      }
    }

    // Update table on load.
    Drupal.OfflineSignup.updateTable();

    $('#offline-signup-content-sync').addClass('offline-signup-sync-processed');
  }
}

Drupal.OfflineSignup.actionLinks = function() {
  var ul = $('<ul class="links">');
  ul.append('<li class="0 first"><a href="#sync" onclick="Drupal.OfflineSignup.editUser($(this).parents(\'tr\'))">' + Drupal.t('Edit') + '</a></li>');
  ul.append('<li class="1 last"><a href="#sync" onclick="Drupal.OfflineSignup.removeUser($(this).parents(\'tr\'))">' + Drupal.t('Remove') + '</a></li>');
  return ul;
}

Drupal.OfflineSignup.updateTable = function() {
  var length = 0;
  for (var i in Drupal.OfflineSignup.users) length++;
  if (length > 0) {
    // Users exist locally clear and populate table.
    $table = $('#offline-signup-content-sync table.sticky-enabled');
    var tbody = $('<tbody>');
    for (var i in Drupal.OfflineSignup.users) {
      var user = Drupal.OfflineSignup.users[i];
      var row = $('<tr>');
      row.append('<td>' + Drupal.checkPlain(user.name) + '</td>');
      row.append('<td>' + Drupal.checkPlain(user.mail) + '</td>');
      row.append('<td>TODO</td>');
      row.append('<td>' + Drupal.checkPlain(user.status) + '</td>');
      row.append($('<td>').append(Drupal.OfflineSignup.actionLinks()));
      tbody.append(row);
    }

    $('tbody', $table).replaceWith(tbody);

    $header = Drupal.OfflineSignup.activeHeader;
    var index = $('#offline-signup-content-sync table.sticky-enabled th').index($header.parents('th'));
    Drupal.OfflineSignup.sortTable(index, $header.data('sort'));
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
    $('td', $(row)).removeClass('active');
    $(row).children('td').eq(column).addClass('active');
    $table.children('tbody').append(row);
  });

  Drupal.OfflineSignup.stripeTable($table);
}

Drupal.OfflineSignup.stripeTable = function($table) {
  $('tbody tr:even', $table).removeClass('even').addClass('odd');
  $('tbody tr:odd', $table).removeClass('odd').addClass('even');
}

Drupal.OfflineSignup.editUser = function(row) {
  var mail = $('td:nth(1)', row).text();
  var user = Drupal.OfflineSignup.users[mail];

  switch (user.status) {
    case 'new':
      var $registerForm = $('#offline-signup-user-register-form');

      // Populate the register form.
      var $inputs = $('input, textarea, select', $registerForm);
      $inputs.each(function(i, el) {
        if (user[el.name] != undefined) {
          if (el.type == 'checkbox') {
            $(el).attr('checked', ((user[el.name]) ? 'checked' : ''));
          }
          else {
            $(el).val(user[el.name]);
          }
        }
      });

      // Ensure router form is hidden.
      $('#offline-signup-user-router-form').hide();

      // Make register form show.
      $registerForm.show();

      // We want to redirect back to this tab.
      Drupal.OfflineSignup.redirect = 'sync';

      $(Drupal.OfflineSignup.menuBar.tabs['signup'].element).click();
      break;
    case 'update':
      var $updateForm = $('#offline-signup-user-update-form');

      // Populate the update form.
      var $inputs = $('input, textarea, select', $updateForm);
      $inputs.each(function(i, el) {
        if (user[el.name] != undefined) {
          if (el.type == 'checkbox') {
            $(el).attr('checked', ((user[el.name]) ? 'checked' : ''));
          }
          else {
            $(el).val(user[el.name]);
          }
        }
      });

      // Ensure router form is hidden.
      $('#offline-signup-user-router-form').hide();

      // Make update form show.
      $updateForm.show();

      // We want to redirect back to this tab.
      Drupal.OfflineSignup.redirect = 'sync';

      $(Drupal.OfflineSignup.menuBar.tabs['signup'].element).click();
      break;
  }
}

Drupal.OfflineSignup.removeUser = function(row) {
  var $table = $('#offline-signup-content-sync table.sticky-enabled');
  var mail = $('td:nth(1)', row).text();
  delete(Drupal.OfflineSignup.users[mail]);
  localStorage.setItem('offlineSignupUsers', Drupal.OfflineSignup.toJson(Drupal.OfflineSignup.users));
  for (var i in Drupal.OfflineSignup.emails) {
    if (Drupal.OfflineSignup.emails[i] == mail) {
      delete(Drupal.OfflineSignup.emails[i]);
      break;
    }
  }
  $(row).remove();
  if (!$('tbody', $table).html()) {
    $('tbody', $table).append('<tr><td class="active" colspan="5">' + Drupal.t('No users added to this event.') + '</td></tr>');
  }
  Drupal.OfflineSignup.stripeTable($table);
}
