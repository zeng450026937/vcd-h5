export function setupEventHandlers(target, eventHandlers) {
  if (!target) {
    return;
  }

  Object.entries(eventHandlers).forEach(([ event, handler ]) => {
    target.on(event, handler);
  });
}

export function removeEventHandlers(target, eventHandlers) {
  if (!target) {
    return;
  }
  
  Object.entries(eventHandlers).forEach(([ event, handler ]) => {
    target.removeListener(event, handler);
  });
}
