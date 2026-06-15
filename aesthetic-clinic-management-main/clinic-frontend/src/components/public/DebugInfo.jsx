import { useEffect } from 'react';

function DebugInfo() {
  useEffect(() => {
    console.log("🐛 DebugInfo mounted");
    console.log("Current URL:", window.location.href);
    console.log("Pathname:", window.location.pathname);
    console.log("LocalStorage token:", localStorage.getItem("token"));
    console.log("LocalStorage user:", localStorage.getItem("user"));
    
    // Check if there's any redirect happening
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('redirect')) {
          console.log("🚨 Redirect detected:", entry);
        }
      }
    });
    observer.observe({ entryTypes: ['navigation'] });
    
    return () => observer.disconnect();
  }, []);
  
  return null;
}

export default DebugInfo;