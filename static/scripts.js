window.addEventListener('load', () => {
  console.log('Remoteee Web v1.0.0');

  const sensor = document.querySelector('#sensor');
  const ws = new WebSocket(`ws://${location.host}`);
  const touch = {
    start: {x: 0, y: 0},
  };
  const send = (event, data) => {
    ws.send(JSON.stringify({event, data}));
  };

  ws.addEventListener('open', () => {
    console.debug('Connected to server');
    sensor.classList.add('on');
    sensor.classList.remove('off');
  });

  ws.addEventListener('close', (event) => {
    console.debug(`Disconnected from server (code ${event.code})`);
    sensor.classList.remove('on');
    sensor.classList.add('off');
  });

  sensor.addEventListener('click', () => {
    send('click', {button: 'left'});
  });

  sensor.addEventListener('touchstart', (event) => {
    touch.start.x = event.touches[0].screenX;
    touch.start.y = event.touches[0].screenY;

    if (event.touches.length === 2) {
      send('click', {button: 'right'});
    }
  });

  sensor.addEventListener('touchmove', (event) => {
    const data = {
      x: (event.changedTouches[0].screenX - touch.start.x) * 1.8,
      y: (event.changedTouches[0].screenY - touch.start.y) * 1.8,
    };
    if (!data.x && !data.y) {
      return;
    }
    send('move', data);
    touch.start.x = event.touches[0].screenX;
    touch.start.y = event.touches[0].screenY;
  });
});
