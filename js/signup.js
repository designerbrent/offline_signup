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
      var $inputs = $('input, textarea, select', $(this).parents('form'));
      var user = {};
      var errors = new Array();
      $inputs.each(function(i, el) {
        if (el.type == 'checkbox') {
          user[el.name] = $(el).is(':checked') * 1;
        }
        else {
          switch (el.name) {
            case 'back':
            case 'create':
            case 'form_build_id':
            case 'form_id':
            case 'form_token':
              break;
            default:
              if ($(el).hasClass('required') && !$(el).val()) {
                var label = $(el).siblings('label').text();
                label = label.substr(0, label.indexOf(':'));
                errors.push(Drupal.t('@label field is required.', { '@label': label }));
                $(el).addClass('error');
              }
              user[el.name] = $(el).val();
              break;
          }
        }
      });

      if (errors.length > 0) {
        alert(errors.join("\n"));
        return false;
      }

      if (Drupal.OfflineSignup.users[user.mail] == undefined) {
        // Generate name from mail.
        user.name = Drupal.OfflineSignup.genName(user.mail);
      }
      else {
        user.name = Drupal.OfflineSignup.users[user.mail].name;
      }

      // Mark user status as new.
      user.status = 'new';

      // Save new user locally.
      Drupal.OfflineSignup.users[user.mail] = user;
      localStorage.setItem('offlineSignupUsers', Drupal.OfflineSignup.toJson(Drupal.OfflineSignup.users));

      // Reset forms and navigate back to the router form.
      $routerForm[0].reset();
      $registerForm.hide();
      alert('Account information saved.');
      $inputs.removeClass('error');
      $routerForm.show();
      $registerForm[0].reset();
      $updateForm[0].reset();

      // Redirect if needed.
      if (Drupal.OfflineSignup.redirect != undefined) {
        $(Drupal.OfflineSignup.menuBar.tabs[Drupal.OfflineSignup.redirect].element).click();
        delete(Drupal.OfflineSignup.redirect);
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

    $('#offline-signup-content-signup').addClass('offline-signup-content-processed');
  }
}
