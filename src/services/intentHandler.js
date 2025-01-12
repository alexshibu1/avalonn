const INTENTS = {
    EMERGENCY: 'emergency',
    MAINTENANCE: 'maintenance',
    NOISE: 'noise',
    UTILITIES: 'utilities'
  };
  
  export async function handleIntent(intent, params) {
    switch (intent) {
      case INTENTS.EMERGENCY:
        return handleEmergency(params);
      case INTENTS.MAINTENANCE:
        return handleMaintenance(params);
      case INTENTS.NOISE:
        return handleNoise(params);
      case INTENTS.UTILITIES:
        return handleUtilities(params);
      default:
        return getDefaultResponse();
    }
  }
  
  function handleEmergency(params) {
    return {
      message: "I understand this is an emergency. The property manager has been notified and will contact you immediately.",
      priority: "high",
      requiresImmediate: true
    };
  }
  
  function handleMaintenance(params) {
    return {
      message: "Your maintenance request has been logged. We will address it during regular business hours.",
      priority: "normal"
    };
  }
  
  function handleNoise(params) {
    return {
      message: "Your noise complaint has been logged. Please note that quiet hours are from 10 PM to 7 AM.",
      priority: "normal"
    };
  }
  
  function handleUtilities(params) {
    return {
      message: "Your utility issue has been logged. We will investigate this during regular business hours.",
      priority: "normal"
    };
  }
  
  function getDefaultResponse() {
    return {
      message: "Your complaint has been logged. We will review it and take appropriate action.",
      priority: "normal"
    };
  }