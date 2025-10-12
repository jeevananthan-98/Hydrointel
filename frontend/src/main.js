// This file can be used for advanced application setup,
// such as registering service workers for offline functionality
// or other global scripts.

console.log("main.js script loaded. You can add advanced features here.");

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
