'use strict'

var toc = document.querySelector('.section-nav')
var tocPath = document.querySelector('.toc-marker path')
var tocItems

// Factor of screen size that the element must cross
// before it's considered visible
var TOP_MARGIN = 0.1
var BOTTOM_MARGIN = 0.2

var pathLength

window.addEventListener('resize', drawPath, false)
window.addEventListener('scroll', sync, false)

drawPath()

function drawPath() {
  tocItems = [].slice.call(toc.querySelectorAll('li'))

  // Cache element references and measurements
  tocItems = tocItems.map(function(item) {
    var anchor = item.querySelector('a')
    var targetAnchors = document.getElementsByClassName('anchor')
    targetAnchors = [].slice.call(targetAnchors)
    var target = targetAnchors.filter(targetElement => {
      return targetElement.hash.slice(1) === encodeURIComponent(anchor.getAttribute('href').slice(1))
    })[0]

    anchor.addEventListener('click', (evt) => {
      evt.preventDefault()
      const { y } = target.getBoundingClientRect()
      const [ _, hashString ] = target.href.split('#')

      scrollBy(y - 2, 300, () => window.location.hash = hashString)
    })

    return {
      listItem: item,
      anchor: anchor,
      target: target
    }
  })

  // Remove missing targets
  tocItems = tocItems.filter(function(item) {
    return !!item.target
  })

  var path = []
  var pathIndent

  tocItems.forEach(function(item, i) {
    var x = item.anchor.offsetLeft - 5,
      y = item.anchor.offsetTop,
      height = item.anchor.offsetHeight

    if (i === 0) {
      path.push('M', x, y, 'L', x, y + height)
      item.pathStart = 0
    } else {
      // Draw an additional line when there's a change in
      // indent levels
      if (pathIndent !== x) path.push('L', pathIndent, y)

      path.push('L', x, y)

      // Set the current path so that we can measure it
      tocPath.setAttribute('d', path.join(' '))
      item.pathStart = tocPath.getTotalLength() || 0

      path.push('L', x, y + height)
    }

    pathIndent = x

    tocPath.setAttribute('d', path.join(' '))
    item.pathEnd = tocPath.getTotalLength()
  })

  pathLength = tocPath.getTotalLength()

  sync()
}

function sync() {
  var windowHeight = window.screen.availHeight

  var pathStart = pathLength
  var pathEnd = 0

  var visibleItems = 0

  tocItems.forEach(function(item) {
    var { y } = item.target.getBoundingClientRect()

    if ( y > 1 && y < windowHeight - 20) {
      pathStart = Math.min(item.pathStart, pathStart)
      pathEnd = Math.max(item.pathEnd, pathEnd)

      visibleItems += 1

      item.listItem.classList.add('visible')
    } else {
      item.listItem.classList.remove('visible')
    }
  })

  // Specify the visible path or hide the path altogether
  // if there are no visible items
  if (visibleItems > 0 && pathStart < pathEnd) {
    tocPath.setAttribute('stroke-dashoffset', '1')
    tocPath.setAttribute(
      'stroke-dasharray',
      '1, ' + pathStart + ', ' + (pathEnd - pathStart) + ', ' + pathLength
    )
    tocPath.setAttribute('opacity', 1)
  }
}

function scrollBy(distance, duration, callback) {
  var initialY = document.scrollingElement.scrollTop
  var y = initialY + distance
  var baseY = (initialY + y) * 0.5
  var diff = initialY - baseY
  var startTime = performance.now()
  console.log(diff)

  function step() {
    var normalizedTime = (performance.now() - startTime) / duration
    if (normalizedTime > 1) {
      normalizedTime = 1
      callback && callback()
    }
    window.scrollTo(0, baseY + diff * Math.cos(normalizedTime * Math.PI))
    if (normalizedTime < 1) {
      window.requestAnimationFrame(step)
    }
  }

  window.requestAnimationFrame(step)
}

var anchors = new AnchorJS()
anchors.add()