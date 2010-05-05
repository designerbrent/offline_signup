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

  for (var i in Drupal.settings.offlineSignup.menuTabs) {
    var type = Drupal.settings.offlineSignup.menuTabs[i];
    this.tabs[type] = new Drupal.OfflineSignup.Tab(type, this);
  }

  // Set the active tab.
  var url = document.location.toString();
  if (url.match('#')) {
    // Make tab active based on anchor if it isn't already active.
    var anchor = '#' + url.split('#')[1];
    if (!$('a[href="' + anchor + '"]', $(this.element)).hasClass('active')) {
      $('a[href="' + anchor + '"]', $(this.element)).click();
    }
  }
}

Drupal.OfflineSignup.Tab = function(type, menuBar) {
  this.type = type;
  this.menuBar = menuBar;
  this.element = $('li.' + this.type + ' a', $(this.menuBar.element)).get();

  var self = this;

  $(this.element).click(function() {
    // Determine if there was a previously active tab.
    var prevType = self.determineType($('li.active', $(self.menuBar.menuElement)));
    if (prevType) {
      // Trigger the tab blur event for the previous tab.
      self.menuBar.tabs[prevType].blur();
    }

    // Trigger the tab focus event for the clicked tab.
    self.focus();
  });
}

Drupal.OfflineSignup.Tab.prototype.determineType = function(element) {
  for (var i in Drupal.settings.offlineSignup.menuTabs) {
    var type = Drupal.settings.offlineSignup.menuTabs[i];
    if (element.hasClass(type)) {
      return type;
    }
  }
}

Drupal.OfflineSignup.Tab.prototype.blur = function() {
  $('#offline-signup-content-' + this.type).hide();
  $(this.element).removeClass('active').parent().removeClass('active');
}

Drupal.OfflineSignup.Tab.prototype.focus = function() {
  $(this.element).addClass('active').parent().addClass('active');
  $('#offline-signup-content-' + this.type).show();
}
