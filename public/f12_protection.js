// F12 Protection Script - Prevent Developer Tools
(function() {
  'use strict';
  
  // Disable right-click
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I (Inspect)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.keyCode === 73)) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.keyCode === 74)) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.keyCode === 67)) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+S (Save)
    if (e.ctrlKey && (e.key === 'S' || e.keyCode === 83)) {
      e.preventDefault();
      return false;
    }
  });

  // Detect DevTools
  let devtools = { open: false, orientation: null };
  const threshold = 160;
  
  const emitEvent = (isOpen, orientation) => {
    if (isOpen) {
      // Redirect or show warning
      document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-size:24px;font-family:Arial;">⚠️ Developer Tools are not allowed!</div>';
    }
  };

  const main = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const orientation = widthThreshold ? 'vertical' : 'horizontal';

    if (!(heightThreshold && widthThreshold) && ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
      if (!devtools.open || devtools.orientation !== orientation) {
        emitEvent(true, orientation);
      }
      devtools.open = true;
      devtools.orientation = orientation;
    } else {
      if (devtools.open) {
        emitEvent(false, null);
      }
      devtools.open = false;
      devtools.orientation = null;
    }
  };

  setInterval(main, 500);

  // Disable console
  if (!window.console) window.console = {};
  const methods = ['log', 'debug', 'warn', 'info', 'error', 'dir', 'trace', 'assert'];
  for (let i = 0; i < methods.length; i++) {
    console[methods[i]] = function() {};
  }

  // Clear console
  if (window.console.clear) {
    window.console.clear();
  }

  // Debugger trap
  setInterval(function() {
    debugger;
  }, 100);
})();
