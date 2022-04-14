// region Variables

/**
 * Web socket instance to communicate with the server.
 * @type WebSocket
 */
let socket = null;

/**
 * Web socket timeout reference for reconnecting.
 * @type {number}
 */
let socketTimer = 0;

/**
 * Touchpad HTML element and touch start position.
 * @type {{start: {x: number, y: number}, element: HTMLButtonElement}}
 */
const touchpad = {
  element: document.querySelector('#touchpad'),
  start: { x: 0, y: 0 },
};

// endregion

// region Functions

/** Setup web socket, connect and watch for events. */
function socketSetup() {
  // Close any current websocket connection.
  socketClose(false);
  // Instantiate new web socket connection.
  socket = new WebSocket(`ws://${location.host}`);
  // Trigger touchpad update for connecting.
  touchpadUpdateStatus();
  /** Watch open event and trigger touchpad update for connection. */
  socket.addEventListener('open', () => {
    console.debug('Connected to server');
    touchpadUpdateStatus();
  });
  /** Watch close event and close web socket and attempt to reconnect. */
  socket.addEventListener('close', (event) => {
    console.debug(`Disconnected from server (code ${event.code})`);
    socketClose(true);
  });
  /** Watch error event and close web socket and attept to reconnect. */
  socket.addEventListener('error', () => {
    console.debug(`Error from server`);
    socketClose(true);
  });
}

/**
 * Close current web socket and optionally attempt to reconnect.
 * @param reconnect {boolean}
 */
function socketClose(reconnect) {
  if (socket) {
    socket.close();
  }
  socket = null;
  touchpadUpdateStatus();
  if (reconnect) {
    clearTimeout(socketTimer);
    socketTimer = setTimeout(() => {
      socketSetup();
    }, 5000);
  }
}

/**
 * Send a message to web socket server.
 * @param event {string} Type of event.
 * @param data {Record<string, any>} Data of event.
 */
function socketSend(event, data) {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }
  socket.send(JSON.stringify({ event, data }));
}

/** Setup touchpad element. */
function touchpadSetup() {
  /** Watch click event and send click event to web socket. */
  touchpad.element.addEventListener('click', () => {
    socketSend('click', { button: 'left' });
  });
  /** Watch touchstart event. */
  touchpad.element.addEventListener('touchstart', (event) => {
    /** Store start position. */
    touchpad.start.x = event.touches[0].screenX;
    touchpad.start.y = event.touches[0].screenY;
    /** If touch is with 2 fingers, send right click event to server. */
    if (event.touches.length === 2) {
      socketSend('click', { button: 'right' });
    }
  });
  /** Watch touchmove event and send movement to server. */
  touchpad.element.addEventListener('touchmove', (event) => {
    /** Only 1 finger. */
    if (event.touches.length !== 1) {
      return;
    }
    /** Store data calculated with sensitivity and start position. */
    const data = {
      x: (event.changedTouches[0].screenX - touchpad.start.x) * 1.8,
      y: (event.changedTouches[0].screenY - touchpad.start.y) * 1.8,
    };
    /** Don't send data if no movement. */
    if (!data.x && !data.y) {
      return;
    }
    // Send movement data to server.
    socketSend('move', data);
    /** Store this position as start for the next event. */
    touchpad.start.x = event.touches[0].screenX;
    touchpad.start.y = event.touches[0].screenY;
  });
}

/** Update touchpad element with current web socket status. */
function touchpadUpdateStatus() {
  let status;
  switch (socket?.readyState) {
    case WebSocket.CLOSED:
    case WebSocket.CLOSING:
    case WebSocket.CONNECTING: {
      status = 'connecting';
      break;
    }
    case WebSocket.OPEN: {
      status = 'connected';
      break;
    }
    default: {
      status = 'closed';
      break;
    }
  }
  touchpad.element.setAttribute('data-status', status);
}

// endregion

// region Events

/** Watch load event and setup everything. */
window.addEventListener('load', () => {
  console.log(`Mouseee ${version}`);
  socketSetup();
  touchpadSetup();
});

// endregion
