
const btnLeft = document.getElementById('js-navBtnLeft')
const btnRight = document.getElementById('js-navBtnRight')
const targetImage = document.getElementById('js-imageDemo')

function setupInitialPage() {
  const showImage = (window.location.hash === '#js-imageDemo')
  targetImage.hidden = !showImage
}

setupInitialPage()

let buildLoadHandler

console.log('window.navigation?', window.navigation)

if (window.navigation) {
  buildLoadHandler = (side) => {
    return () => {
      window.navigation.navigate('#js-imageDemo', { info: { side }})
    }
  }

  window.navigation.addEventListener('navigate', (event) => {

    const u = new URL(event.destination.url)
    //console.info('info---------(event)',event)
    // console.info('u.hash?',u.hash)

    if (!event.canTransition || u.pathname !== '/') {
      return
    }

    if (u.hash === '#js-imageDemo') {
      // We can handle this one. If 'info' is unspecified, it might be because
      // this is a URL navigation, or Back and Forward was pressed.
      // console.info('got side request', event.info?.side)
      // console.info('event.info', event.info)

      targetImage.hidden = false

      if (event.info?.side) {
        event.intercept({
          focusReset: 'manual',
          scroll: 'manual',
          async handler() {


            const transformDirection = (event.info.side === 'left' ? -1 : +1)

            targetImage.style.transition = 'none'
            // if left then translateX(-80vw)
            // if right then translateX(80vw)
            targetImage.style.transform = `translateX(${transformDirection * 80}vw)`
            targetImage.offsetLeft  // force layout

            const p = new Promise((r) => {
              targetImage.addEventListener('transitionend', () => r(true))
            })
            const abort = new Promise((_, reject) => {
              event.signal.addEventListener('abort', () => reject(new Error))
            })

            targetImage.style.transform = ''
            targetImage.style.transition = ''

            await Promise.race([p, abort])
            //console.info('transition complete')
            //console.log('targetImage.hidden?:', targetImage.hidden)
          }
        })
      }

    } else {
      targetImage.hidden = true
      //console.log('targetImage.hidden?:', targetImage.hidden)
    }
  })

} else {
  const hint = document.getElementById('hint')
  hint.hidden = false


  buildLoadHandler = (side) => {
    return () => {
      window.history.pushState(null, '', '#js-imageDemo')
      setupInitialPage()
    }
  }

  window.addEventListener('popstate', () => setupInitialPage())
}

btnLeft.onclick = buildLoadHandler('left')
btnRight.onclick = buildLoadHandler('right')
