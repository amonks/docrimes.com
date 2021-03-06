/* global THREE */

var container
var f = 0
var crimes
var cccccc
var og

var camera
var controls
var scene
var renderer

var wireframeMaterial, normalMaterial, mats

init()
animate()

function init () {

  wireframeMaterial = new THREE.MeshNormalMaterial({ overdraw: 0.5, wireframe: true })
  normalMaterial = new THREE.MeshNormalMaterial({ overdraw: 0.5, wireframe: false })
  mats = [wireframeMaterial, normalMaterial]

  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
  camera.position.z = 100

  controls = new THREE.TrackballControls(camera)

  controls.rotateSpeed = 1.0
  controls.zoomSpeed = 1.2
  controls.panSpeed = 0.8

  controls.noZoom = false
  controls.noPan = false

  controls.staticMoving = true
  controls.dynamicDampingFactor = 0.3

  controls.keys = [ 65, 83, 68 ]

  controls.addEventListener('change', render)

  // scene

  scene = new THREE.Scene()

  var ambient = new THREE.AmbientLight(0x101030)
  scene.add(ambient)

  var directionalLight = new THREE.DirectionalLight(0xffeedd)
  directionalLight.position.set(0, 0, 1)
  scene.add(directionalLight)

  var manager = new THREE.LoadingManager()
  manager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total)
  }

  var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100
      console.log(Math.round(percentComplete, 2) + '% downloaded')
    }
  }

  var onError = function (xhr) {
  }

  // model

  var loader = new THREE.OBJLoader(manager)
  loader.load('crimes.obj', function (object) {
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        console.log('got a mesh!')
        crimes = child
        child.material = wireframeMaterial
      }
    })
    og = crimes.geometry.attributes.position.array
    crimes.geometry.dynamic = true
    // crimes = object
    crimes.scale.x = 5
    crimes.scale.y = 5
    crimes.scale.z = 5
    scene.add(crimes)
  }, onProgress, onError)

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, alpha: true })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)

  controls.handleResize()
}

//

function animate () {
  f += 1
  if (crimes) { crimes.material = mats[f % 3] }

  window.requestAnimationFrame(animate)
  if (crimes && crimes.geometry && crimes.geometry.attributes.position) {
    for (var i = 0; i < crimes.geometry.attributes.position.array.length / 3; i++) {
      var a = crimes.geometry.attributes.position.array
      var x = i * 3
      var y = i * 3 + 1
      var z = i * 3 + 2
      var t = (f + i)

      a[y] += Math.sin(t / 13) * 0.001
      a[x] += Math.cos(t / 30) * 0.001
      if ((i + f) % 3 === 0) {
        a[z] += Math.tan(5 * t) * 0.002
      } else {
        a[z] = og[z]
      }
    }
    crimes.geometry.attributes.position.needsUpdate = true
  }
  render()
  controls.update()
}

function render () {
  camera.lookAt(scene.position)

  renderer.render(scene, camera)
}
