// $Id$

Drupal.behaviors.offlineSignupContent = function() {
  if ($('#offline-signup-content-signup:not(.offline-signup-content-processed)').size()) {
    var $routerForm = $('#offline-signup-user-router-form');
    var $registerForm = $('#offline-signup-user-register-form');
    var $updateForm = $('#offline-signup-user-update-form');

    // Router form.
    $('.form-submit', $routerForm).click(function() {
      var $mailInput = $('input[name=mail]', $routerForm);
      var mail = $mailInput.val();
      if (Drupal.OfflineSignup.mailValid(mail)) {
        if ($mailInput.hasClass('error')) {
          $mailInput.removeClass('error');
        }

        if (Drupal.OfflineSignup.mailTaken(mail)) {
          $routerForm.hide();
          $('input[name=mail]', $updateForm).val(mail);
          $updateForm.show();
        }
        // E-mail address is available.
        else {
          $routerForm.hide();
          $('input[name=mail]', $registerForm).val(mail);
          $registerForm.show();
        }
      }
      // Invalid e-mail address.
      else {
        $mailInput.addClass('error');
        alert(Drupal.t('Invalid e-mail address. Please enter a valid e-mail address.'));
      }
      return false;
    });

    // Register form.
    $('input[name=mail]', $registerForm).focus(function() {
      $('input[name=back]', $registerForm).click();
      $('input[name=mail]', $routerForm).focus();
    });
    $('input[name=back]', $registerForm).click(function() {
      $registerForm.hide();
      $routerForm.show();
      return false;
    });
    $('input[name=create]', $registerForm).click(function() {
      if (user = Drupal.OfflineSignup.submitForm($(this).parents('form'))) {
        if (Drupal.OfflineSignup.users[user.mail] == undefined) {
          // Generate name from mail.
          user.name = Drupal.OfflineSignup.genName(user.mail);
          user.source = 'local';
        }
        else {
          // We use $.extend to generate a clone of the user object rather than
          // reference it.
          originalUser = $.extend({}, Drupal.OfflineSignup.users[user.mail]);
          user = $.extend(originalUser, user);
        }

        // Mark user status as new.
        user.status = 'new';

        // Attach profile types to the user.
        user.profiles = Drupal.OfflineSignup.profiles.types($registerForm, user);

        if (user.profiles.length > 0) {
          // Save current user data into a temp object.
          Drupal.OfflineSignup.tempUser = user;

          // Since profiles are requested, we don't save the new user until all
          // requested profiles have been filled out. We add the profile types
          // to a 'stack' the form progress will follow. We use slice(0) on the
          // user.profiles array to create a full copy of the profile types the
          // user wants.
          Drupal.OfflineSignup.stack = user.profiles.slice(0);

          var profileType = Drupal.OfflineSignup.stack.shift();
          if (profile = Drupal.OfflineSignup.profiles.getProfile(profileType)) {
            // Hide the register form.
            $registerForm.hide();

            // Disable the menu tabs. The only way to break from this multistep
            // form is to cancel or finish it.
            Drupal.OfflineSignup.menuBar.disableTabs();

            // Show the appropriate profile form.
            profile.show(user);
          }
          else {
            alert(Drupal.t('There was an error loading the request profile type object.'));
          }
        }
        // No profiles to set so save user.
        else {
          // Save new user locally.
          Drupal.OfflineSignup.users[user.mail] = user;
          Drupal.OfflineSignup.setLocal('offlineSignupUsers', Drupal.OfflineSignup.users);

          // Reset forms and navigate back to the router form.
          $('form', $('#offline-signup-content-signup')).each(function() {
            $(this)[0].reset();
          });
          $registerForm.hide();
          alert('Account information saved.');
          $routerForm.show();

          // Redirect if needed.
          if (Drupal.OfflineSignup.redirectTab != undefined) {
            Drupal.OfflineSignup.redirect(Drupal.OfflineSignup.redirectTab);
          }
        }
      }
      return false;
    });

    // Update form.
    $('input[name=mail]', $updateForm).focus(function() {
      $('input[name=back]', $updateForm).click();
      $('input[name=mail]', $routerForm).focus();
    });
    $('input[name=back]', $updateForm).click(function() {
      $updateForm.hide();
      $routerForm.show();
      return false;
    });
    $('input[name=update]', $updateForm).click(function() {
      if (user = Drupal.OfflineSignup.submitForm($(this).parents('form'))) {
        // We use $.extend to generate a clone of the user object rather than
        // reference it.
        originalUser = $.extend({}, Drupal.OfflineSignup.users[user.mail]);
        user = $.extend(originalUser, user);

        // If user.name is undefined, we are updating a user on the server.
        if (user.name == undefined) {
          // Find and set the name for the user.
          for (var i in Drupal.OfflineSignup.emails) {
            if (Drupal.OfflineSignup.emails[i] == user.mail) {
              user.name = i;
              user.source = 'server';
              break;
            }
          }
        }

        // Mark user status as updated only if the status is not 'new'.
        if (user.status != 'new') user.status = 'updated';

        // Attach profile types to the user.
        user.profiles = Drupal.OfflineSignup.profiles.types($updateForm, user);

        if (user.profiles.length > 0) {
          // Save current user data into a temp object.
          Drupal.OfflineSignup.tempUser = user;

          // Since profiles are requested, we don't save the new user until all
          // requested profiles have been filled out. We add the profile types
          // to a 'stack' the form progress will follow. We use slice(0) on the
          // user.profiles array to create a full copy of the profile types the
          // user wants.
          Drupal.OfflineSignup.stack = user.profiles.slice(0);

          var profileType = Drupal.OfflineSignup.stack.shift();
          if (profile = Drupal.OfflineSignup.profiles.getProfile(profileType)) {
            // Hide the register form.
            $updateForm.hide();

            // Disable the menu tabs. The only way to break from this multistep
            // form is to cancel or finish it.
            Drupal.OfflineSignup.menuBar.disableTabs();

            // Show the appropriate profile form.
            profile.show(user);
          }
          else {
            alert(Drupal.t('There was an error loading the request profile type object.'));
          }
        }
        // No profiles to set so save user.
        else {
          // Save new user locally.
          Drupal.OfflineSignup.users[user.mail] = user;
          Drupal.OfflineSignup.setLocal('offlineSignupUsers', Drupal.OfflineSignup.users);

          // Reset forms and navigate back to the router form.
          $('form', $('#offline-signup-content-signup')).each(function() {
            $(this)[0].reset();
          });
          $updateForm.hide();
          alert('Account information saved.');
          $routerForm.show();

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
