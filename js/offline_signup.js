// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};
Drupal.OfflineSignup.emails = {};
Drupal.OfflineSignup.users = {};
Drupal.OfflineSignup.tables = {};

Drupal.behaviors.offlineSignup = function(context) {
  if ($('#offline-signup-page:not(.offline-signup-processed)').size()) {
    if (window.localStorage == undefined) {
      $('#offline-signup-page').before('<div class="messages error">' + Drupal.t('This browser does not support local storage.') + '</div>');
      return;
    }

    Drupal.OfflineSignup.emails = Drupal.settings.offlineSignup.emails;

    if (Drupal.settings.offlineSignup.users) {
      Drupal.OfflineSignup.users = Drupal.settings.offlineSignup.users;
    }

    if (users = Drupal.OfflineSignup.getLocal('offlineSignupUsers')) {
      $.extend(Drupal.OfflineSignup.users, users);
    }

    // Add emails to list of taken emails.
    for (var i in Drupal.OfflineSignup.users) {
      var user = Drupal.OfflineSignup.users[i];
      Drupal.OfflineSignup.emails[user.name] = user.mail;
    }

    // Reveal the page.
    $('#offline-signup-page').show();

    $('#offline-signup-page').addClass('offline-signup-processed');
  }
}

Drupal.OfflineSignup.setLocal = function(id, data) {
  localStorage.setItem(id, Drupal.OfflineSignup.toJson(data));
  console.log(localStorage.getItem('offlineSignupUsers'));
}

Drupal.OfflineSignup.getLocal = function(id) {
  if (string = localStorage.getItem(id)) {
    return Drupal.parseJson(string);
  }
  return false;
}

Drupal.OfflineSignup.removeLocal = function(id) {
  localStorage.removeItem(id);
}

Drupal.OfflineSignup.getUser = function(mail) {
  if (Drupal.OfflineSignup.users[mail]) {
    return Drupal.OfflineSignup.users[mail];
  }
  return false;
}

Drupal.OfflineSignup.mailTaken = function(mail) {
  for (var i in Drupal.OfflineSignup.emails) {
    if (Drupal.OfflineSignup.emails[i] == mail) {
      return true;
    }
  }
  return false;
}

Drupal.OfflineSignup.genName = function(mail) {
  var index = mail.indexOf("@");
  var origName = mail.slice(0, index);
  var name = origName;
  var num = 0;
  while (!Drupal.OfflineSignup.nameAvailable(name)) {
    num++;
    name = origName + num;
  }
  return name;
}

Drupal.OfflineSignup.nameAvailable = function(name) {
  if (Drupal.OfflineSignup.emails[name] == undefined) {
    return true;
  }
  return false;
}

Drupal.OfflineSignup.mailValid = function(mail) {
  var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  return reg.test(mail);
}

/**
 *  Convert a variable to a json string.
 */
Drupal.OfflineSignup.toJson = function(v) {
  switch (typeof v) {
    case 'boolean':
      return v == true ? 'true' : 'false';
    case 'number':
      return v;
    case 'string':
      return '"'+ v +'"';
    case 'object':
      var output = new Array();
      for (var i in v) {
        output.push('"' + i + '"' + ": " + Drupal.OfflineSignup.toJson(v[i]));
      }
      return '{ ' + output.join(', ') + ' }';
    case 'array':
      var output = new Array();
      for (var i in v) {
        output.push(Drupal.OfflineSignup.toJson(v[i]));
      }
      return '[ ' + output.join(', ') + ' ]';
    default:
      return 'null';
  }
};

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
