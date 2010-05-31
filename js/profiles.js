// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};

Drupal.behaviors.offlineSignupProfiles = function() {
  if (Drupal.OfflineSignup.profiles == undefined) {
    Drupal.OfflineSignup.profiles = new Drupal.OfflineSignup.Profiles();
  }
}

Drupal.OfflineSignup.Profiles = function() {
  this.profiles = {};
  for (var type in Drupal.settings.offlineSignup.profiles) {
    this.profiles[type] = new Drupal.OfflineSignup.Profile(type);
  }
}

Drupal.OfflineSignup.Profiles.prototype.getProfile = function(type) {
  if (this.profiles[type]) {
    return this.profiles[type];
  }
  return false;
}

Drupal.OfflineSignup.Profiles.prototype.types = function($form, user) {
  var profiles = new Array();
  $('.profile-type', $form).each(function() {
    if ($(this).is(':checked')) {
      profiles.push($(this).attr('name'));
    }
  });
  return profiles;
}

Drupal.OfflineSignup.Profiles.prototype.list = function(user) {
  if (user.profiles && user.profiles.length > 0) {
    var list = '<ul>';
    for (var i in user.profiles) {
      var name = Drupal.settings.offlineSignup.profiles[user.profiles[i]];
      list += '<li>' + Drupal.t(name) + '</li>';
    }
    list += '</ul>';
    return list;
  }
  return '';
}

Drupal.OfflineSignup.Profile = function(type) {
  this.type = type;
  this.element = $('#' + type + '-node-form-wrapper').get();

  if ($('#' + type + '-node-form-wrapper:not(.node-form-wrapper-processed)').size()) {
    $('input[name=op]', $(this.element)).click(function() {
      
      return false;
    });

    $(this.element).addClass('node-form-wrapper-processed');
  }
}

Drupal.OfflineSignup.Profile.prototype.show = function(user) {
  if (user) {
    // Loop through the form elements and update the form with any necessary
    // changes based on the user data.
    var $inputs = $('input, textarea, select', $(this.element));
    $inputs.each(function(i, el) {
      if (user[el.name]) {
        if (el.type == 'checkbox') {
          $(el).attr('checked', user[el.name]);
        }
        else {
          $(el).val(user[el.name]);
        }
      }
    });
  }

  $(this.element).show();
}
