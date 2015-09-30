/* global THREE */

var container
var f = 0
var camera
var crimes
var scene
var renderer
var mouseX = 0
var mouseY = 0
var windowHalfX = window.innerWidth / 2
var windowHalfY = window.innerHeight / 2

init()
animate()

function init () {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
  camera.position.z = 100

  // scene

  scene = new THREE.Scene()

  var ambient = new THREE.AmbientLight(0x101030)
  scene.add(ambient)

  var directionalLight = new THREE.DirectionalLight(0xffeedd)
  directionalLight.position.set(0, 0, 1)
  scene.add(directionalLight)

  // texture

  var manager = new THREE.LoadingManager()
  manager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total)
  }

  var texture = new THREE.Texture()

  var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100
      console.log(Math.round(percentComplete, 2) + '% downloaded')
    }
  }

  var onError = function (xhr) {
  }

  var loader = new THREE.ImageLoader(manager)
  loader.load('tex.jpg', function (image) {
    texture.image = image
    texture.needsUpdate = true
  })

  // model

  loader = new THREE.OBJLoader(manager)
  loader.load('crimes.obj', function (object) {
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        console.log('got a mesh!')
        crimes = child
        child.material = new THREE.MeshNormalMaterial({ overdraw: 0.5 })
      }
    })
    crimes.geometry.dynamic = true
    // crimes = object
    crimes.scale.x = 5
    crimes.scale.y = 5
    crimes.scale.z = 5
    scene.add(crimes)
  }, onProgress, onError)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  document.addEventListener('mousemove', onDocumentMouseMove, false)

  window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize () {
  windowHalfX = window.innerWidth / 2
  windowHalfY = window.innerHeight / 2

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onDocumentMouseMove (event) {
  mouseX = (event.clientX - windowHalfX) / 4
  mouseY = (event.clientY - windowHalfY) / 4
}

//

function animate () {
  f += 1
  window.requestAnimationFrame(animate)
  if (crimes && crimes.geometry && crimes.geometry.attributes.position) {
    for (var i = 0; i < crimes.geometry.attributes.position.array.length / 3; i++) {
      if (f <= 10 && i <= 20) {
        console.log(i * 3 + 2)
      }
      var a = crimes.geometry.attributes.position.array
      var x = i * 3
      var y = i * 3 + 1
      var z = i * 3 + 2
      var t = (f + i) * .1
      a[y] += Math.sin(t) * 0.01
      a[x] += Math.sin(t) * 0.01
      a[z] += Math.sin(t) * 0.1
    }
    crimes.geometry.attributes.position.needsUpdate = true
  }
  render()
}

function render () {
  camera.position.x += (-mouseX - camera.position.x) * 0.005
  camera.position.y += (mouseY - camera.position.y) * 0.005

  camera.lookAt(scene.position)

  renderer.render(scene, camera)
}
