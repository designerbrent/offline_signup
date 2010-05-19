// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};
Drupal.OfflineSignup.Sync = {};

Drupal.behaviors.offlineSignupSync = function() {
  if ($('#offline-signup-sync-users-table:not(.offline-signup-sync-processed)').size()) {
    Drupal.OfflineSignup.Sync.userTable = new Drupal.OfflineSignup.Table($('#offline-signup-sync-users-table').get());

    // Add our sub-tabs of 'Event' and 'Local'.
    var ul = $('<ul id="offline-signup-sync-sub-tabs" class="links">');
    ul.append('<li><a href="#sync">' + Drupal.t('Event') + '</a></li>');
    ul.append('<li class="active"><a class="active" href="#sync">' + Drupal.t('Local') + '</a></li>');
    $(Drupal.OfflineSignup.Sync.userTable.element).before(ul);
    Drupal.OfflineSignup.Sync.userTable.data = 'local';
    // Add click events to the sub-tabs.
    $('#offline-signup-sync-sub-tabs li:first a').click(function() {
      delete(Drupal.OfflineSignup.Sync.userTable.data);
      $('#offline-signup-sync-sub-tabs li:last').removeClass('active').children('a').removeClass('active');
      $(this).addClass('active').parents('li').addClass('active');
      Drupal.OfflineSignup.Sync.userTable.update();
      return false;
    });
    $('#offline-signup-sync-sub-tabs li:last a').click(function() {
      Drupal.OfflineSignup.Sync.userTable.data = 'local';
      $('#offline-signup-sync-sub-tabs li:first').removeClass('active').children('a').removeClass('active');
      $(this).addClass('active').parents('li').addClass('active');
      Drupal.OfflineSignup.Sync.userTable.update();
      return false;
    });

    Drupal.OfflineSignup.Sync.userTable.update = function() {
      var tbody = $('<tbody>');
      for (var i in Drupal.OfflineSignup.users) {
        var user = Drupal.OfflineSignup.users[i];

        if (this.data == 'local' && user.source != 'local') {
          continue;
        }

        var row = $('<tr>');
        row.append('<td>' + Drupal.checkPlain(user.name) + '</td>');
        row.append('<td>' + Drupal.checkPlain(user.mail) + '</td>');
        row.append('<td>TODO</td>');
        row.append('<td>' + Drupal.checkPlain(user.source) + '</td>');
        row.append('<td>' + Drupal.checkPlain(user.status) + '</td>');
        row.append($('<td>').append(Drupal.OfflineSignup.actionLinks()));
        tbody.append(row);
      }

      $('tbody', $(this.element)).replaceWith(tbody);
      $column = this.activeColumn;
      var index = $('th', $(this.element)).index($column.parents('th'));
      this.sort(index, $column.data('sort'));
    }

    // Update users table on load.
    Drupal.OfflineSignup.Sync.userTable.update();

    $('#offline-signup-sync-users-table').addClass('offline-signup-sync-processed');
  }

  if ($('#offline-signup-sync-drawings-table:not(.offline-signup-sync-processed)').size()) {
    Drupal.OfflineSignup.Sync.drawingsTable = new Drupal.OfflineSignup.Table($('#offline-signup-sync-drawings-table').get());

    Drupal.OfflineSignup.Sync.drawingsTable.update = function() {
      var tbody = $('<tbody>');
      for (var i in Drupal.OfflineSignup.drawings.drawings) {
        var drawing = Drupal.OfflineSignup.drawings.drawings[i];

        if (drawing.state == 3) {
          var row = $('<tr>');
          row.append('<td>' + Drupal.checkPlain(drawing.id) + '</td>');
          row.append('<td>' + Drupal.checkPlain(drawing.user.name) + '</td>');
          row.append('<td>' + Drupal.checkPlain(drawing.user.mail) + '</td>');
          row.append('<td>' + Drupal.checkPlain(drawing.formatDate()) + '</td>');
          tbody.append(row);
        }
      }

      $('tbody', $(this.element)).replaceWith(tbody);
      $column = this.activeColumn;
      var index = $('th', $(this.element)).index($column.parents('th'));
      this.sort(index, $column.data('sort'));
    }

    // Update drawings table on load.
    Drupal.OfflineSignup.Sync.drawingsTable.update();

    $('#offline-signup-sync-drawings-table').addClass('offline-signup-sync-processed');
  }

  if ($('#offline-signup-content-sync:not(.offline-signup-sync-processed)').size()) {
    // When tab is active, we need to (re)populate the table rows for all local
    // users. Override the default focus method with our own.
    Drupal.OfflineSignup.menuBar.tabs['sync'].focus = function(animate) {
      // Before we reveal the sync page, we first (re)populate the user table.
      Drupal.OfflineSignup.Sync.userTable.update();

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

Drupal.OfflineSignup.Table = function(element) {
  var self = this;

  this.element = element;

  // Store the ASC and DESC images and remove the DESC from displaying by default.
  this.images = {
    asc: $('thead th a img:first', $(this.element)),
    desc: $('thead th a img:last', $(this.element)).remove()
  }

  // Set the default activeColumn.
  $('thead th:first', $(this.element)).addClass('active').children('a').addClass('active');
  this.activeColumn = $('thead th.active a.active', $(this.element)).data('sort', 'asc');

  // Apply click events to table headers.
  $('thead th a', $(this.element)).each(function() {
    var $header = $(this).parents('th');
    $(this).click(function() {
      var sort = 'asc';
      var index = $('th', $(self.element)).index($header);
      if ($('img', $header).size()) {
        // Determine the sort direction.
        sort = (self.activeColumn.data('sort') != 'asc') ? 'asc' : 'desc';
        $('img', $header).replaceWith(self.images[sort]);
      }
      else {
        // Since no img yet exists, we default sort to ASC.
        $('img', self.activeColumn).remove();
        $header.append(self.images.asc);
      }
      // Set this header to activeColumn.
      self.activeColumn = $(this).data('sort', sort);
      self.sort(index, sort);
      return false;
    });
  });
}

Drupal.OfflineSignup.Table.prototype.update = function() {
  
}

Drupal.OfflineSignup.Table.prototype.sort = function(column, sort) {
  var self = this;
  var rows = $(self.element).find('tbody > tr').get();
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
    $('tbody', $(self.element)).append(row);
  });

  self.stripe();
}

Drupal.OfflineSignup.Table.prototype.stripe = function() {
  $('tbody tr:even', $(this.element)).removeClass('even').addClass('odd');
  $('tbody tr:odd', $(this.element)).removeClass('odd').addClass('even');
}

Drupal.OfflineSignup.actionLinks = function() {
  var ul = $('<ul class="links">');
  ul.append('<li class="0 first"><a href="#sync" onclick="Drupal.OfflineSignup.editUser($(this).parents(\'tr\'))">' + Drupal.t('Edit') + '</a></li>');
  ul.append('<li class="1 last"><a href="#sync" onclick="Drupal.OfflineSignup.removeUser($(this).parents(\'tr\'))">' + Drupal.t('Remove') + '</a></li>');
  return ul;
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
