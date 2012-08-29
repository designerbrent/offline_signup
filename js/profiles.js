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
    // After the save button, we add a cancel button.
    var cancelButton = $('<input class="form-submit" type="submit" value="' + Drupal.t('Cancel') + '" name="cancel">');
    $('input[name=op]', $(this.element)).after(cancelButton);

    $('input[name=op]', $(this.element)).click(function() {
      var user;
      if (user = Drupal.OfflineSignup.submitForm($(this).parents('form'), Drupal.OfflineSignup.tempUser)) {
        if (Drupal.OfflineSignup.stack && Drupal.OfflineSignup.stack.length > 0) {
          // Save changes to temp user.
          Drupal.OfflineSignup.tempUser = user;

          // Progress to next profile in stack
          var profileType = Drupal.OfflineSignup.stack.shift();
          if (profile = Drupal.OfflineSignup.profiles.getProfile(profileType)) {
            // Show the appropriate profile form.
            profile.show(user);
          }
          else {
            alert(Drupal.t('There was an error loading the request profile type object.'));
          }
        }
        else {
          // Save the user.
          Drupal.OfflineSignup.users[user.mail] = user;
          Drupal.OfflineSignup.setLocal('offlineSignupUsers', Drupal.OfflineSignup.users);
          delete(Drupal.OfflineSignup.tempUser);

          // Reset forms.
          $('form', $('#offline-signup-content-signup')).each(function() {
            $(this)[0].reset();
          });

          Drupal.OfflineSignup.activeProfile.hide();

          alert('Account information saved.');

          // Reveal the router form.
          $('#offline-signup-user-form').show();

          // Enable menu tabs.
          Drupal.OfflineSignup.menuBar.enableTabs();
        }
      }
      return false;
    });
    $('input[name=cancel]', $(this.element)).click(function() {
      Drupal.OfflineSignup.activeProfile.hide();

      // Reset forms.
      $('form', $('#offline-signup-content-signup')).each(function() {
        $(this)[0].reset();
      });

      // Reveal the router form.
      $('#offline-signup-user-form').show();

      // Enable menu tabs.
      Drupal.OfflineSignup.menuBar.enableTabs();
      return false;
    });

    $(this.element).addClass('node-form-wrapper-processed');
  }
}

Drupal.OfflineSignup.Profile.prototype.show = function(user) {
  if (Drupal.OfflineSignup.activeProfile) {
    Drupal.OfflineSignup.activeProfile.hide();
  }

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

  // Set this profile to the active profile.
  Drupal.OfflineSignup.activeProfile = this;

  $(this.element).show();
}

Drupal.OfflineSignup.Profile.prototype.hide = function() {
  $(this.element).hide();
  delete(Drupal.OfflineSignup.activeProfile);
}
