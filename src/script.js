import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import gsap from 'gsap'

import Model from './model'

/*------------------------------
Renderer
------------------------------*/
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
const gl = canvas.getContext('webgl', { xrCompatible: true })

// Set up the WebGLRenderer, which handles rendering to the session's base layer.
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  preserveDrawingBuffer: true,
  canvas: canvas,
  context: gl,
})
renderer.autoClear = false

/*------------------------------
Scene & Camera
------------------------------*/
const scene = new THREE.Scene()

// The API directly updates the camera matrices.
// Disable matrix auto updates so three.js doesn't attempt
// to handle the matrices independently.
const camera = new THREE.PerspectiveCamera()
camera.matrixAutoUpdate = false

/**
 * XR Session
 */
const createXRSession = async () => {
  // Initialize a WebXR session using "immersive-ar".
  const session = await navigator.xr.requestSession('immersive-ar')
  session.updateRenderState({
    baseLayer: new XRWebGLLayer(session, gl),
  })

  // A 'local' reference space has a native origin that is located
  // near the viewer's position at the time the session was created.
  const referenceSpace = await session.requestReferenceSpace('local')

  // Create a render loop that allows us to draw on the AR view.
  const onXRFrame = (time, frame) => {
    // Queue up the next draw request.
    session.requestAnimationFrame(onXRFrame)

    // Bind the graphics framebuffer to the baseLayer's framebuffer
    gl.bindFramebuffer(
      gl.FRAMEBUFFER,
      session.renderState.baseLayer.framebuffer
    )

    // Retrieve the pose of the device.
    // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
    const pose = frame.getViewerPose(referenceSpace)
    if (pose) {
      // In mobile AR, we only have one view.
      const view = pose.views[0]

      const viewport = session.renderState.baseLayer.getViewport(view)
      renderer.setSize(viewport.width, viewport.height)

      // Use the view's transform matrix and projection matrix to configure the THREE.camera.
      camera.matrix.fromArray(view.transform.matrix)
      camera.projectionMatrix.fromArray(view.projectionMatrix)
      camera.updateMatrixWorld(true)

      // Render the scene with THREE.WebGLRenderer.
      renderer.render(scene, camera)
    }
  }
  session.requestAnimationFrame(onXRFrame)
}

/**
 * CHECK XR SUPPORT
 */
const checkForXRSupport = async () => {
  // Check to see if there is an XR device available that supports immersive VR
  // presentation (for example: displaying in a headset). If the device has that
  // capability the page will want to add an "Enter VR" button to the page (similar to
  // a "Fullscreen" button) that starts the display of immersive VR content.
  navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
    if (supported) {
      var enterXrBtn = document.createElement('button')
      enterXrBtn.innerHTML = 'Enter VR'
      enterXrBtn.addEventListener('click', beginXRSession)
      document.body.appendChild(enterXrBtn)

      console.log('supported!')
    } else {
      console.log('Session not supported: ' + reason)
    }
  })
}

/*------------------------------
Mesh
------------------------------*/
// const geometry = new THREE.BoxGeometry(1, 1, 1)
// const material = new THREE.MeshBasicMaterial({
//   color: 0x00ff00,
// })
// const cube = new THREE.Mesh(geometry, material)
// scene.add(cube)

// The cube will have a different color on each side.
const materials = [
  new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  new THREE.MeshBasicMaterial({ color: 0x0000ff }),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
  new THREE.MeshBasicMaterial({ color: 0xff00ff }),
  new THREE.MeshBasicMaterial({ color: 0x00ffff }),
  new THREE.MeshBasicMaterial({ color: 0xffff00 }),
]

// Create the cube and add it to the demo scene.
const cube = new THREE.Mesh(
  new THREE.BoxBufferGeometry(0.2, 0.2, 0.2),
  materials
)
cube.position.set(0, 0, 0)
scene.add(cube)

/*------------------------------
OrbitControls
------------------------------*/
const controls = new OrbitControls(camera, renderer.domElement)

/*------------------------------
Models
------------------------------*/
// const skull = new Model({
//   name: 'skull',
//   file: './models/skull.glb',
//   colors: ['red', 'yellow'],
//   background: '#47001b',
//   placeOnLoad: true,
//   scene,
// })

// const horse = new Model({
//   name: 'horse',
//   file: './models/horse.glb',
//   colors: ['blue', 'pink'],
//   background: '#110047',
//   scene,
// })

/*------------------------------
Activate XR
------------------------------*/
const activateXR = () => {
  navigator.xr.addEventListener('devicechange', checkForXRSupport)
  createXRSession()
}

/*------------------------------
Controllers
------------------------------*/
const buttons = document.querySelectorAll('.button')
buttons[0].addEventListener('click', () => {
  activateXR()
})

/*------------------------------
Resize
------------------------------*/
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', onWindowResize, false)

/*------------------------------
Mouse move
------------------------------*/
// const onMouseMove = ({ clientX, clientY }) => {
//   const x = clientX
//   const y = clientY

//   gsap.to(scene.rotation, {
//     y: -gsap.utils.mapRange(0, window.innerWidth, 0.2, -0.2, x),
//     x: -gsap.utils.mapRange(0, window.innerHeight, 0.2, -0.2, y),
//   })
// }
// window.addEventListener('mousemove', onMouseMove)
