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

Drupal.OfflineSignup.NewUser = function() {
  
}

Drupal.OfflineSignup.UpdateUser = function() {
  
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
        output.push(i + ":" + Drupal.OfflineSignup.toJson(v[i]));
      }
      return '{ ' + output.join(', ') + ' }';
    default:
      return 'null';
  }
};
