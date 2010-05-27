// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};
Drupal.OfflineSignup.Sync = {};

Drupal.behaviors.offlineSignupSync = function() {
  if ($('#offline-signup-sync-form:not(.offline-signup-sync-processed)').size()) {
    $('input[name=sync]', $('#offline-signup-sync-form')).click(function() {
      for (var i in Drupal.OfflineSignup.tables) {
        if (Drupal.OfflineSignup.tables[i].sync) {
          Drupal.OfflineSignup.tables[i].sync();
        }
      }
      return false;
    });

    $('#offline-signup-sync-form').addClass('offline-signup-sync-processed');
  }

  if ($('#offline-signup-sync-users-table:not(.offline-signup-sync-processed)').size()) {
    var table = new Drupal.OfflineSignup.Table($('#offline-signup-sync-users-table').get());

    // Add our sub-tabs of 'Event' and 'Local'.
    var ul = $('<ul id="offline-signup-sync-sub-tabs" class="links">');
    ul.append('<li><a href="#sync">' + Drupal.t('Event') + '</a></li>');
    ul.append('<li class="active"><a class="active" href="#sync">' + Drupal.t('Local') + '</a></li>');
    $(table.element).before(ul);
    table.data = 'local';
    // Add click events to the sub-tabs.
    $('#offline-signup-sync-sub-tabs li:first a').click(function() {
      var table = Drupal.OfflineSignup.tables['offline-signup-sync-users-table'];
      delete(table.data);
      $('#offline-signup-sync-sub-tabs li:last').removeClass('active').children('a').removeClass('active');
      $(this).addClass('active').parents('li').addClass('active');
      table.update();
      return false;
    });
    $('#offline-signup-sync-sub-tabs li:last a').click(function() {
      var table = Drupal.OfflineSignup.tables['offline-signup-sync-users-table'];
      table.data = 'local';
      $('#offline-signup-sync-sub-tabs li:first').removeClass('active').children('a').removeClass('active');
      $(this).addClass('active').parents('li').addClass('active');
      table.update();
      return false;
    });

    table.update = function() {
      var tbody = $('<tbody>');
      for (var i in Drupal.OfflineSignup.users) {
        var user = Drupal.OfflineSignup.users[i];

        if (this.data == 'local' && user.source != 'local') {
          continue;
        }

        var row = $('<tr>');
        if (user.error) {
          row.addClass('error');
        }
        row.append('<td>' + Drupal.checkPlain(user.name) + '</td>');
        row.append('<td>' + Drupal.checkPlain(user.mail) + '</td>');
        row.append('<td>TODO</td>');
        row.append('<td>' + Drupal.checkPlain(user.source) + '</td>');
        row.append('<td>' + Drupal.checkPlain(user.status) + '</td>');
        row.append($('<td>').append(Drupal.OfflineSignup.actionLinks(user)));
        tbody.append(row);
      }

      $('tbody', $(this.element)).replaceWith(tbody);
      $column = this.activeColumn;
      var index = $('th', $(this.element)).index($column.parents('th'));
      this.sort(index, $column.data('sort'));
    }

    // Sync table.
    table.sync = function() {
      $('#offline-signup-sync-sub-tabs li.active').removeClass('active').children('a').removeClass('active');
      $('tbody tr', $(this.element)).each(function() {
        var $row = $(this);
        if (user = Drupal.OfflineSignup.users[$('td:nth(1)', $row).text()]) {
          if (user.status == 'updated' || user.status == 'new') {
            var url = Drupal.settings.basePath + 'offline_signup/ajax/sync/user';
            if (user.profiles) {
              var profiles = user.profiles.join(',');
              url += '?profile=' + escape(profiles);
            }
            $('#offline-signup-sync-form').ajaxSubmit({
              url: url,
              data: $.extend(Drupal.OfflineSignup.Sync.getUserData(user), { event: Drupal.OfflineSignup.settings.event }),
              success: function(responseText, status) {
                if (responseText.error) {
                  $row.addClass('error');
                  user.error = responseText.messages;
                }
                else {
                  $row.removeClass('error');
                  user.source = 'server';
                  if (user.error) {
                    delete(user.error);
                  }
                  user.status = '';
                  $('td:nth(3)', $row).empty().append('server');
                  $('td:nth(4)', $row).empty();
                  $('td:nth(5)', $row).empty().append(Drupal.OfflineSignup.actionLinks(user));
                }
                Drupal.OfflineSignup.setLocal('offlineSignupUsers', Drupal.OfflineSignup.users);
              },
              complete: function(response, status) {
                if (status != 'success') {
                  alert(Drupal.t('Cannot connect to the server.'));
                }
              },
              dataType: 'json',
              type: 'POST',
              async: true
            });
          }
        }
      });
    }

    // Update users table on load.
    table.update();

    Drupal.OfflineSignup.tables['offline-signup-sync-users-table'] = table;

    $('#offline-signup-sync-users-table').addClass('offline-signup-sync-processed');
  }

  if ($('#offline-signup-sync-drawings-table:not(.offline-signup-sync-processed)').size()) {
    var table = new Drupal.OfflineSignup.Table($('#offline-signup-sync-drawings-table').get());

    table.update = function() {
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

    table.sync = function() {
      $('tbody tr', $(this.element)).each(function() {
        
      });
    }

    // Update drawings table on load.
    table.update();

    Drupal.OfflineSignup.tables['offline-signup-sync-drawings-table'] = table;

    $('#offline-signup-sync-drawings-table').addClass('offline-signup-sync-processed');
  }

  if ($('#offline-signup-content-sync:not(.offline-signup-sync-processed)').size()) {
    // When tab is active, we need to (re)populate the table rows for all local
    // users. Override the default focus method with our own.
    Drupal.OfflineSignup.menuBar.tabs['sync'].focus = function(animate) {
      // Before we reveal the sync page, we first (re)populate the user table
      // and drawings table.
      Drupal.OfflineSignup.tables['offline-signup-sync-users-table'].update();
      Drupal.OfflineSignup.tables['offline-signup-sync-drawings-table'].update();

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

Drupal.OfflineSignup.Sync.getUserData = function(user) {
  var data = {};
  for (var i in user) {
    data["user[" + i + "]"] = user[i];
  }
  return data;
}

Drupal.OfflineSignup.actionLinks = function(user) {
  var ul = $('<ul class="links">');
  ul.append('<li class="0 first"><a href="#sync" onclick="Drupal.OfflineSignup.editUser($(this).parents(\'tr\'))">' + Drupal.t('Edit') + '</a></li>');
  if (user.status == 'new' || user.status == 'updated') {
    ul.append('<li class="1 last"><a href="#sync" onclick="Drupal.OfflineSignup.removeUser($(this).parents(\'tr\'))">' + Drupal.t('Remove') + '</a></li>');
  }
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
  var table = Drupal.OfflineSignup.tables['offline-signup-sync-users-table'];
  var mail = $('td:nth(1)', row).text();
  delete(Drupal.OfflineSignup.users[mail]);
  Drupal.OfflineSignup.setLocal('offlineSignupUsers', Drupal.OfflineSignup.users);
  for (var i in Drupal.OfflineSignup.emails) {
    if (Drupal.OfflineSignup.emails[i] == mail) {
      delete(Drupal.OfflineSignup.emails[i]);
      break;
    }
  }
  $(row).remove();
  table.stripe();
}
