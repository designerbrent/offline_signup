// $Id$

Drupal.behaviors.offlineSignupContent = function() {
  if ($('#offline-signup-content-signup:not(.offline-signup-content-processed)').size()) {
    // User form.
    var $userForm = $('#offline-signup-user-form');
    $('input[name=mail]', $userForm).blur(function() {
      var mail = $(this).val();
      if (Drupal.OfflineSignup.mailValid(mail)) {
        $(this).removeClass('error');
      }
      else if ($(this).val() != '') {
        $(this).addClass('error');
        alert(Drupal.t('Invalid e-mail address. Please enter a valid e-mail address.'));
      }
    });
    $('input[name=save]', $userForm).click(function() {
      var user;
      if (user = Drupal.OfflineSignup.submitForm($(this).parents('form'))) {
        if (!Drupal.OfflineSignup.users[user.mail]) {
          var name;
          var status = 'new';
          var source = 'local';
          for (var i in Drupal.OfflineSignup.emails) {
            if (Drupal.OfflineSignup.emails[i] == user.mail) {
              name = i;
              status = 'updated';
              source = 'server';
              break;
            }
          }
          if (!name) {
            name = Drupal.OfflineSignup.genName(user.mail);
          }
          user.name = name;
          user.status = status;
          user.source = source;
        }
        else {
          var originalUser = $.extend({}, Drupal.OfflineSignup.users[user.mail]);
          user = $.extend(originalUser, user);

          // Mark user status as updated only if the status is not 'new'.
          if (user.status != 'new') user.status = 'updated';
        }

        // Attach profile types to the user.
        user.profiles = Drupal.OfflineSignup.profiles.types($userForm, user);

        if (user.profiles.length > 0) {
          // Save current user data into a temp object.
          Drupal.OfflineSignup.tempUser = user;

          // Since profiles are requested, we don't save the new user until all
          // requested profiles have been filled out. We add the profile types
          // to a 'stack' the form progress will follow. We use slice(0) on the
          // user.profiles array to create a full copy of the profile types the
          // user has requested.
          Drupal.OfflineSignup.stack = user.profiles.slice(0);

          var profileType = Drupal.OfflineSignup.stack.shift();
          var profile;
          if (profile = Drupal.OfflineSignup.profiles.getProfile(profileType)) {
            // Hide the user form.
            $userForm.hide();

            // Disable the menu tabs. The only way to break from this multistep
            // form is to cancel or finish it.
            Drupal.OfflineSignup.menuBar.disableTabs();

            // Show the appropriate profile form.
            profile.show(user);
          }
          else {
            alert(Drupal.t('There was an error loading the requested profile type object.'));
          }
        }
        // No profiles to set, so save user.
        else {
          // Save new user locally.
          Drupal.OfflineSignup.users[user.mail] = user;
          Drupal.OfflineSignup.setLocal('offlineSignupUsers', Drupal.OfflineSignup.users);

          // Reset form(s).
          $('form', $('#offline-signup-content-signup')).each(function() {
            $(this)[0].reset();
          });
          alert(Drupal.t('Account information saved.'));

          // Redirect if needed.
          if (Drupal.OfflineSignup.redirectTab != undefined) {
            Drupal.OfflineSignup.redirect(Drupal.OfflineSignup.redirectTab);
          }
        }
      }
      return false;
    });

    $('#offline-signup-content-signup').addClass('offline-signup-content-processed');
  }
}
