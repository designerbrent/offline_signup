// $Id$

Drupal.OfflineSignup = Drupal.OfflineSignup || {};

Drupal.behaviors.offlineSignupDrawings = function() {
  if ($('#offline-signup-content-drawings:not(.offline-signup-content-processed)').size()) {
    Drupal.OfflineSignup.drawings = new Drupal.OfflineSignup.Drawings();

    $('#offline-signup-content-drawings').addClass('offline-signup-content-processed');
  }
}

Drupal.OfflineSignup.Drawings = function() {
  this.form = $('#offline-signup-drawings-form').remove();
  this.drawings = new Array();

  this.init(Drupal.OfflineSignup.settings.drawings);
}

Drupal.OfflineSignup.Drawings.prototype.init = function(num) {
  // Only grab locally stored drawings if we haven't already.
  if (this.drawings.length == 0) {
    if (localDrawings = Drupal.OfflineSignup.getLocal('offlineSignupDrawings')) {
      for (var i in localDrawings) {
        this.initDrawing(localDrawings[i]);
      }
    }
  }
  // Drawings have already been loaded. Remove any with a state less than 2.
  // We'll rebuild the blank states below.
  else {
    var end = null;
    for (var i = 0; i < this.drawings.length; i++) {
      if (this.drawings[i].state < 2) {
        if (this.drawings[i].form) {
          $(this.drawings[i].form).remove();
        }
        if (end == null) end = i;
      }
    }
    if (end) {
      this.drawings = this.drawings.slice(0, end);
    }
  }

  if (this.drawings[this.drawings.length - 1] && this.drawings[this.drawings.length - 1].state == 3) {
    // We want to enable the first new drawing.
    var enableFirst = true;
  }

  if (num > this.drawings.length) {
    var diff = num - this.drawings.length;
    for (i = 0; i < diff; i++) {
      this.initDrawing();
      if (enableFirst && i == 0) {
        var key = this.drawings.length - 1;
        this.drawings[key].enableState(1);
      }
    }
  }
}

Drupal.OfflineSignup.Drawings.prototype.initDrawing = function(data) {
  var drawing = new Drupal.OfflineSignup.Drawing();

  // Set the ID based on the number of existing drawings.
  drawing.id = this.drawings.length + 1;

  // Init the new form for the drawing.
  drawing.form = this.form.clone();
  $('[id]', drawing.form).each(function() {
    $(this).attr('id', $(this).attr('id') + '-' + drawing.id);
  });

  // Modify fieldset legend to reflect which drawing number this is.
  $('fieldset > legend', drawing.form).empty().append(Drupal.t('Drawing @num', { '@num': drawing.id }));

  if (data) {
    drawing.user = Drupal.OfflineSignup.users[data.mail];
    if (drawing.user) {
      drawing.state = data.state;
      drawing.date = new Date(data.date);
      drawing.event = data.event;
      drawing.saved = data.saved;
      if (data.error) drawing.error = data.error;
      drawing.setInfos();
    }
  }
  // If this is the first drawing and it's state is 0, move it to state 1.
  else if (drawing.id == 1 && drawing.state == 0) {
    drawing.state = 1;
    drawing.event = Drupal.OfflineSignup.settings.event;
    drawing.saved = false;
  }

  $('#offline-signup-content-drawings').append(drawing.form);

  // Set click events.
  $('input[name=select_winner]', drawing.form).click(function() {
    drawing.selectWinner();
    return false;
  });
  $('input[name=select_another]', drawing.form).click(function() {
    drawing.selectWinner();
    return false;
  });
  $('input[name=keep_winner]', drawing.form).click(function() {
    drawing.keepWinner();
    return false;
  });
  $('input[name=cancel]', drawing.form).click(function() {
    drawing.cancelWinner();
    return false;
  });

  // Move the drawing to the appropriate state.
  drawing.enableState();

  return this.drawings.push(drawing);
}

Drupal.OfflineSignup.Drawings.prototype.save = function() {
  var drawings = new Array();
  for (var i in this.drawings) {
    if (this.drawings[i].state > 1) {
      var drawing = {
        mail: this.drawings[i].user.mail,
        state: this.drawings[i].state,
        date: this.drawings[i].date.getTime(),
        event: this.drawings[i].event,
        saved: this.drawings[i].saved
      };
      if (this.drawings[i].error) {
        drawing.error = this.drawings[i].error;
      }
      drawings.push(drawing);
    }
  }

  Drupal.OfflineSignup.setLocal('offlineSignupDrawings', drawings);
}

Drupal.OfflineSignup.Drawings.prototype.nextDrawing = function(id) {
  // The id is not 0-indexed so we effectively grab the next drawing.
  return this.drawings[id];
}

Drupal.OfflineSignup.Drawings.prototype.getDrawing = function(id) {
  if (drawing = this.drawings[id - 1]) {
    return drawing;
  }
  return false;
}

Drupal.OfflineSignup.Drawing = function() {
  this.id = null;
  this.state = 0;
  this.form = null;
}

Drupal.OfflineSignup.Drawing.prototype.enableState = function(state) {
  if (state == undefined) {
    state = this.state;
  }
  else {
    this.state = state;
    if (Drupal.OfflineSignup.drawings) {
      Drupal.OfflineSignup.drawings.save();
    }
  }

  switch (state) {
    case 0:
      $('.drawing-state-2, .drawing-state-3', this.form).hide();
      $('input[name=select_winner]', this.form).attr('disabled', true);
      break;
    case 1:
      $('.drawing-state-2, .drawing-state-3', this.form).hide();
      $('.drawing-state-1', this.form).show();
      $('input[name=select_winner]', this.form).attr('disabled', false);
      break;
    case 2:
      $('.drawing-state-1, .drawing-state-3', this.form).hide();
      $('.drawing-state-2', this.form).show();
      break;
    case 3:
      $('.drawing-state-1, .drawing-state-2', this.form).hide();
      $('.drawing-state-3', this.form).show();
      break;
  }
}

Drupal.OfflineSignup.Drawing.prototype.selectWinner = function() {
  var emails = new Array();
  for (var i in Drupal.OfflineSignup.users) {
    emails.push(Drupal.OfflineSignup.users[i].mail);
  }

  // Randomly select a user.
  var randomMail = emails[Math.floor(Math.random()*emails.length)];
  if (user = Drupal.OfflineSignup.users[randomMail]) {
    this.user = user;
    this.date = new Date();

    this.setInfos();

    // Enabling the state this way saves locally the changes made.
    this.enableState(2);
  }
  else {
    alert(Drupal.t('There was a problem selecting a winner.'));
  }
}

Drupal.OfflineSignup.Drawing.prototype.setInfos = function() {
  this.setInfo('Name', this.user.name);
  this.setInfo('E-mail', this.user.mail);
  this.setInfo('Selected', this.formatDate());
}

Drupal.OfflineSignup.Drawing.prototype.formatDate = function() {
  var hours = this.date.getHours();
  var minutes = this.date.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  return this.date.getMonth() + '/' + this.date.getDate() + '/' + this.date.getFullYear() + ' - ' + hours + ':' + minutes;
}

Drupal.OfflineSignup.Drawing.prototype.setInfo = function(label, text) {
  var $info = $('label:contains(' + label + ')', this.form);
  var $parent = $info.parent();

  $parent.empty().append($info).append(Drupal.t(text));
}

Drupal.OfflineSignup.Drawing.prototype.keepWinner = function() {
  this.enableState(3);
  if (nextDrawing = Drupal.OfflineSignup.drawings.nextDrawing(this.id)) {
    nextDrawing.enableState(1);
  }
}

Drupal.OfflineSignup.Drawing.prototype.cancelWinner = function() {
  if (this.state < 3) {
    delete(this.user);
    delete(this.date);

    // Enabling the state this way saves locally the changes made.
    this.enableState(1);
  }
  return false;
}

Drupal.OfflineSignup.Drawing.prototype.getData = function() {
  var data = {};
  for (var i in this) {
    switch (i) {
      case 'form':
        break;
      case 'user':
        data['mail'] = this[i].mail;
        break;
      case 'date':
        data[i] = this[i].getTime();
        break;
      default:
        data[i] = this[i];
        break;
    }
  }
}
