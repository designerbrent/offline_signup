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
  $('form', $('#offline-signup-content-drawings')).remove();

  var localDrawings = localStorage.getItem('offlineSignupDrawings');
  if (localDrawings) {
    localDrawings = Drupal.parseJson(localDrawings);
    for (var i in localDrawings) {
      this.initDrawing(localDrawings[i]);
    }
  }

  if (num > this.drawings.length) {
    var diff = num - this.drawings.length;
    for (i = 0; i < diff; i++) {
      this.initDrawing();
    }
  }
}

Drupal.OfflineSignup.Drawings.prototype.initDrawing = function(data) {
  var drawing = new Drupal.OfflineSignup.Drawing();

  if (data) {
    $.extend(drawing, data);
  }

  // Set the ID based on the number of existing drawings.
  drawing.id = this.drawings.length + 1;

  // Init the new form for the drawing.
  drawing.form = this.form.clone();
  $('[id]', drawing.form).each(function() {
    $(this).attr('id', $(this).attr('id') + '-' + drawing.id);
  });

  // Modify fieldset legend to reflect which drawing number this is.
  $('fieldset > legend', drawing.form).empty().append(Drupal.t('Drawing @num', { '@num': drawing.id }));

  // If this is the first drawing and it's state is 0, move it to state 1.
  if (drawing.id == 1 && drawing.state == 0) {
    drawing.state = 1;
  }

  // Move the drawing to the appropriate state.
  drawing.enableState();

  $('#offline-signup-content-drawings').append(drawing.form);

  return this.drawings.push(drawing);
}

Drupal.OfflineSignup.Drawing = function() {
  this.id = null;
  this.state = 0;
  this.form = null;
}

Drupal.OfflineSignup.Drawing.prototype.enableState = function(state) {
  var state = (state != undefined) ? state : this.state;

  switch (state) {
    case 0:
      $('.drawing-state-2, .drawing-state-3', this.form).hide();
      $('input[name=select_winner]', this.form).attr('disabled', true);
      break;
    case 1:
      $('.drawing-state-2, .drawing-state-3', this.form).hide();
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
