// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};
Drupal.OfflineSignup.users = {};

Drupal.behaviors.offlineSignup = function(context) {
  if ($('#offline-signup-page:not(.offline-signup-processed)', context).size()) {
    Drupal.OfflineSignup.users = Drupal.settings.offlineSignup.users;

    // Router form.
    var $routerForm = $('#offline-signup-user-router-form', context);
    $('input[name=mail]', $routerForm).blur(function() {
      var mail = $(this).val();
      if (Drupal.OfflineSignup.mailValid(mail)) {
        if ($(this).hasClass('error')) {
          $(this).removeClass('error');
        }

        if (Drupal.OfflineSignup.mailTaken(mail)) {
          
        }
        // E-mail address is available.
        else {
          
        }
      }
      // Invalid e-mail address.
      else {
        $(this).addClass('error');
        alert(Drupal.t('Invalid e-mail address. Please enter a valid e-mail address.'));
      }
    });
    $('.form-submit', $routerForm).click(function() {
      return false;
    });

    $('#offline-signup-page', context).show();

    $('#offline-signup-page', context).addClass('offline-signup-processed');
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
