// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};

Drupal.behaviors.offlineSignupMenuBar = function(context) {
  if ($('#offline-signup-menu-bar:not(.offline-signup-menu-bar-processed)').size()) {
    Drupal.OfflineSignup.menuBar = new Drupal.OfflineSignup.MenuBar($('#offline-signup-menu-bar').get());
    $(this).addClass('offline-signup-menu-bar-processed');
  }
}

Drupal.OfflineSignup.MenuBar = function(element) {
  this.element = element;
  this.tabs = {};
  this.defaultTab = 'settings';

  // Determine default active tab.
  var url = document.location.toString();
  if (url.match('#')) {
    this.defaultTab = url.split('#')[1];
  }

  for (var i in Drupal.settings.offlineSignup.menuTabs) {
    var type = Drupal.settings.offlineSignup.menuTabs[i];
    this.tabs[type] = new Drupal.OfflineSignup.Tab(type, this);
  }
}

Drupal.OfflineSignup.MenuBar.prototype.enableTabs = function(exempt) {
  for (var i in this.tabs) {
    if (exempt && exempt == i) {
      continue;
    }
    this.tabs[i].enable();
  }
}

Drupal.OfflineSignup.MenuBar.prototype.disableTabs = function(exempt) {
  for (var i in this.tabs) {
    if (exempt && exempt == i) {
      continue;
    }
    this.tabs[i].disable();
  }
}

Drupal.OfflineSignup.Tab = function(type, menuBar) {
  this.type = type;
  this.menuBar = menuBar;
  this.element = $('li.' + this.type + ' a', $(this.menuBar.element)).get();

  var self = this;

  $(this.element).click(function() {
    if ($(this).hasClass('disabled') || $(this).hasClass('active')) {
      return false;
    }

    // Determine if there was a previously active tab.
    var prevType = self.determineType($('li.active', $(self.menuBar.menuElement)));
    if (prevType) {
      // Trigger the tab blur event for the previous tab.
      self.menuBar.tabs[prevType].blur(true);
    }

    // Trigger the tab focus event for the clicked tab.
    self.focus(true);
  });

  (this.type == this.menuBar.defaultTab) ? this.focus() : this.blur();
}

Drupal.OfflineSignup.Tab.prototype.determineType = function(element) {
  for (var i in Drupal.settings.offlineSignup.menuTabs) {
    var type = Drupal.settings.offlineSignup.menuTabs[i];
    if (element.hasClass(type)) {
      return type;
    }
  }
}

Drupal.OfflineSignup.Tab.prototype.blur = function(animate) {
  if (animate) {
    $('#offline-signup-content-' + this.type).slideUp('fast');
  }
  else {
    $('#offline-signup-content-' + this.type).hide();
  }
  $(this.element).removeClass('active').parent().removeClass('active');
}

Drupal.OfflineSignup.Tab.prototype.focus = function(animate) {
  $(this.element).addClass('active').parent().addClass('active');
  if (animate) {
    $('#offline-signup-content-' + this.type).slideDown('fast');
  }
  else {
    $('#offline-signup-content-' + this.type).show();
  }
}

Drupal.OfflineSignup.Tab.prototype.enable = function() {
  $(this.element).removeClass('disabled');
}

Drupal.OfflineSignup.Tab.prototype.disable = function() {
  $(this.element).addClass('disabled');
}
