// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};
Drupal.OfflineSignup.emails = {};
Drupal.OfflineSignup.users = {};

Drupal.behaviors.offlineSignup = function(context) {
  if ($('#offline-signup-page:not(.offline-signup-processed)').size()) {
    if (window.localStorage == undefined) {
      $('#offline-signup-page').before('<div class="messages error">' + Drupal.t('This browser does not support local storage.') + '</div>');
      return;
    }

    Drupal.OfflineSignup.emails = Drupal.settings.offlineSignup.emails;

    if (users = localStorage.getItem('offlineSignupUsers')) {
      users = Drupal.parseJson(users);
      Drupal.OfflineSignup.users = users;
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

Drupal.OfflineSignup.getUser = function(mail) {
  if (Drupal.OfflineSignup.users[mail]) {
    return Drupal.OfflineSignup.users[mail];
  }
  return FALSE;
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
    default:
      return 'null';
  }
};
