// F12 Protection Script - Allow right-click on cards and admin page
(function() {
  'use strict';
  
  // Allow right-click on specific elements (cards and admin page)
  document.addEventListener('contextmenu', function(e) {
    // Check if click is inside a card or admin page
    const isCard = e.target.closest('[class*="card"]') || 
                   e.target.closest('[class*="Card"]') ||
                   e.target.closest('[data-card]');
    
    const isAdminPage = window.location.pathname.includes('/admin') ||
                        document.querySelector('[data-admin-page]') ||
                        e.target.closest('[class*="admin"]');
    
    // Allow right-click on cards and admin page
    if (isCard || isAdminPage) {
      return true; // Allow context menu
    }
    
    // Block right-click everywhere else
    e.preventDefault();
    return false;
  });

  // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, but ALLOW Ctrl+C (Copy)
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
    
    // NOTE: Ctrl+C (Copy) is NOT blocked - users can copy text normally
  });

  // Detect DevTools
  let devtools = { open: false, orientation: null };
  const threshold = 160;
  
  const emitEvent = (isOpen, orientation) => {
    if (isOpen) {
      // Redirect or show warning
      document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-size:24px;font-family:Arial;color:#fff;background:#1a1a1a;">⚠️ Developer Tools are not allowed!</div>';
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
