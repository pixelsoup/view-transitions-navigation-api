
const btnLeft = document.getElementById('js-navBtnLeft')
const btnRight = document.getElementById('js-navBtnRight')
const targetImage = document.getElementById('js-imageDemo')

// https://developer.mozilla.org/en-US/docs/Web/API/Location

// const documentLocation = document.location

// only applies to page load (not on event listeners)
// console.log('documentLocation.host', documentLocation.host) // localhost:5757
// console.log('documentLocation.hostname', documentLocation.hostname) // localhost
// console.log('documentLocation.port', documentLocation.port) // 5757
// console.log('documentLocation.pathname', documentLocation.pathname) // /
// console.log('documentLocation.search', documentLocation.search) // e.g ?model=honda
// console.log('documentLocation.hash', documentLocation.hash) // e.g. #js-imageDemo
// console.log('documentLocation.toString()', documentLocation.toString()) // http://localhost:5757/


function setupInitialPage() {

  const showImage = (window.location.hash === '#js-imageDemo')
  // if window.location.hash is not #js-imageDemo then
  // add hidden attribute (styled with css with low opacity)
  targetImage.hidden = !showImage
}

setupInitialPage()

let buildLoadHandler

// console.log('window.navigation?', window.navigation)

// window.navigation currently supported by Chrome and Edge
if (window.navigation) {
  buildLoadHandler = (side) => {
    return () => {
      window.navigation.navigate('#js-imageDemo', { info: { side }})
    }
  }

  window.navigation.addEventListener('navigate', (event) => {

    const targetUrl = new URL(event.destination.url)
    // console.info('info---------(event)',event) // clickEvent object
    // console.info('targetUrl.hash?',targetUrl.hash) // #js-imageDemo

    if (!event.canTransition || targetUrl.pathname !== '/') {
      return
    }

    // console.info('got side request', event.info?.side)
    // console.info('event.info', event.info)

    if (targetUrl.hash === '#js-imageDemo') {
      // We can handle this one. If 'info' is unspecified, it might be because
      // this is a URL navigation, or Back and Forward was pressed.

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
  const hint = document.getElementById('js-fallbackMessage')
  // if window.navigation is not supported remove hidden attribute from fallback message
  // The Navigation API is not available :(
  hint.hidden = false


  buildLoadHandler = (side) => {
    return () => {
      // pushState(state, unused, url)
      // state
      // The state object is a JavaScript object which is associated with the new history entry created by pushState().
      // Whenever the user navigates to the new state, a popstate event is fired, and the state property of the event contains a copy of the history entry's state object.
      window.history.pushState(null, '', '#js-imageDemo')
      setupInitialPage()
    }
  }
  // Whenever the user navigates to the new state, a popstate event is fired,
  // and the state property of the event contains a copy of the history entry's state object.
  window.addEventListener('popstate', () => setupInitialPage())
}

btnLeft.onclick = buildLoadHandler('left')
btnRight.onclick = buildLoadHandler('right')



targetImage.addEventListener("transitionrun", () => {
  console.log("transitionrun fired")
})

targetImage.addEventListener("transitionstart", () => {
  console.log("transitionstart fired")
})

targetImage.addEventListener("transitioncancel", () => {
  console.log("transitioncancel fired")
})

targetImage.addEventListener("transitionend", () => {
  console.log("transitionend fired")
})