
const left = document.getElementById('left');
const right = document.getElementById('right');
const image = document.getElementById('image');

function setupInitialPage() {
  const showImage = (window.location.hash === '#image');
  image.hidden = !showImage;
}

setupInitialPage();

let buildLoadHandler;

if (window.navigation) {
  buildLoadHandler = (side) => {
    return (event) => {
      window.navigation.navigate('#image', { info: { side }});
    };
  };

  window.navigation.addEventListener('navigate', (e) => {

    const u = new URL(e.destination.url);
    console.info(e);

    if (!e.canTransition || u.pathname !== '/') {
      return;
    }

    if (u.hash === '#image') {
      // We can handle this one. If 'info' is unspecified, it might be because
      // this is a URL navigation, or Back and Forward was pressed.
      console.info('got side request', e.info?.side);
      image.hidden = false;

      if (e.info?.side) {
        e.intercept({
          focusReset: 'manual',
          scroll: 'manual',
          async handler() {
            const dir = (e.info.side === 'left' ? -1 : +1);
            image.style.transition = 'none';
            image.style.transform = `translateX(${dir * 80}vw)`;
            image.offsetLeft;  // force layout

            const p = new Promise((r) => {
              image.addEventListener('transitionend', () => r(true));
            });
            const abort = new Promise((_, reject) => {
              e.signal.addEventListener('abort', () => reject(new Error));
            });

            image.style.transform = '';
            image.style.transition = '';

            await Promise.race([p, abort]);
            console.info('transition complete');
          }
        });
      }

    } else {
      image.hidden = true;
    }
  });

} else {
  const hint = document.getElementById('hint');
  hint.hidden = false;


  buildLoadHandler = (side) => {
    return (event) => {
      window.history.pushState(null, '', '#image');
      setupInitialPage();
    };
  };

  window.addEventListener('popstate', () => setupInitialPage());
}

left.onclick = buildLoadHandler('left');
right.onclick = buildLoadHandler('right');
