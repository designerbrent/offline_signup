// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};
Drupal.OfflineSignup.users = {};

Drupal.behaviors.offlineSignup = function(context) {
  if ($('#offline-signup-page:not(.offline-signup-processed)').size()) {
    if (window.localStorage == undefined) {
      $('#offline-signup-page').before('<div class="messages error">' + Drupal.t('This browser does not support local storage.') + '</div>');
      return;
    }

    Drupal.OfflineSignup.users = Drupal.settings.offlineSignup.users;

    // Reveal the page.
    $('#offline-signup-page').show();

    $('#offline-signup-page').addClass('offline-signup-processed');
  }
}

Drupal.OfflineSignup.mailTaken = function(mail) {
  for (var i in Drupal.OfflineSignup.users) {
    if (Drupal.OfflineSignup.users[i] == mail) {
      return true;
    }
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
        output.push(i + ": " + Drupal.OfflineSignup.toJson(v[i]));
      }
      return '{ ' + output.join(', ') + ' }';
    default:
      return 'null';
  }
};
