// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};

Drupal.behaviors.offlineSignupMenuBar = function(context) {
  if (Drupal.OfflineSignup.menuBar == undefined) {
    Drupal.OfflineSignup.menuBar = new Drupal.OfflineSignup.MenuBar();
  }

  // It's possible more than one menu bar is present. We need to link all menu
  // bars together so how one is used is reflected in all other bars.
  $('.offline-signup-menu-bar:not(.offline-signup-menu-bar-processed)', context).each(function() {
    $menuBar = $(this);

    // Store the bar jQuery object with the main menuBar object.
    Drupal.OfflineSignup.menuBar.bars.push($menuBar);

    // Loop through the list items for the bar.
    $('li', $menuBar).each(function() {
      // Determine what tab type the list item is. Only apply the click event
      // if the type is successfully determined.
      var type = Drupal.OfflineSignup.determineTabType($(this));
      if (type) {
        $('a', $(this)).click(function() {
          // Determine if there was a previously active tab.
          var prevType = Drupal.OfflineSignup.determineTabType($('li.active', $menuBar));
          if (prevType) {
            // Trigger the tab blur event for the previous tab type.
            Drupal.OfflineSignup.menuBar.tabs[prevType].blur();
          }

          // Loop through each bar element to globally affect active tabs.
          for (var i in Drupal.OfflineSignup.menuBar.bars) {
            var bar = Drupal.OfflineSignup.menuBar.bars[i];
            if (prevType) {
              $('li.' + prevType + ' a', bar).removeClass('active').parent().removeClass('active');
            }
            $('li.' + type + ' a', bar).addClass('active').parent().addClass('active');
          }

          // Trigger the tab focus event for the clicked tab's type.
          Drupal.OfflineSignup.menuBar.tabs[type].focus();
        });
      }
    });

    $(this).addClass('offline-signup-menu-bar-processed');
  });

  // Set the active tab.
  var url = document.location.toString();
  if (url.match('#')) {
    // Make tab active based on anchor if it isn't already active.
    var anchor = '#' + url.split('#')[1];
    if (!$('a[href="' + anchor + '"]').hasClass('active')) {
      $('a[href="' + anchor + '"]').click();
    }
  }
}

Drupal.OfflineSignup.determineTabType = function(li) {
  if (li.hasClass('signup')) {
    return 'signup';
  }
  else if (li.hasClass('settings')) {
    return 'settings';
  }
  else if (li.hasClass('winners')) {
    return 'winners';
  }
  else if (li.hasClass('sync')) {
    return 'sync';
  }
}

Drupal.OfflineSignup.MenuBar = function() {
  this.bars = new Array();
  this.tabs = {};

  for (var i in Drupal.settings.offlineSignup.menuTabs) {
    var type = Drupal.settings.offlineSignup.menuTabs[i];
    this.tabs[type] = new Drupal.OfflineSignup.Tab(type);
  }
}

Drupal.OfflineSignup.Tab = function(type) {
  this.type = type;
}

Drupal.OfflineSignup.Tab.prototype.blur = function() {
  $('#offline-signup-content-' + this.type).hide();
}

Drupal.OfflineSignup.Tab.prototype.focus = function() {
  $('#offline-signup-content-' + this.type).show();
}
