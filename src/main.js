import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import tunnelVideo from "./assets/tunnel.mp4";
import bgMusic from "./assets/train.MP3";
import Model from "./model";
import Model2 from "./model2";
// import { manager } from "./manager";
import { HDRI } from "./environment";
import { postprocessing } from "./postprocessing";
import {
  addTopLight,
  addRightLight,
  addBackLight,
  addLeftLight,
  addCeilingLight,
} from "./addLight";
// 创建视频覆盖层
const app = document.querySelector("#app");

// 创建视频容器
const videoContainer = document.createElement("div");
videoContainer.className = "video-container";
app.appendChild(videoContainer);

// 创建视频元素
const video = document.createElement("video");
video.src = tunnelVideo;
video.className = "intro-video";
video.muted = false;
video.playsInline = true;
video.preload = "auto";
video.loop = false;
videoContainer.appendChild(video);

// 创建文字覆盖层
const textOverlay = document.createElement("div");
textOverlay.className = "text-overlay";
textOverlay.innerHTML = `
  <div class="text-content">
    <div class="text-line-1">Worlds in Transit:</div>
    <div class="text-line">The NYC Line</div>
  </div>
`;
videoContainer.appendChild(textOverlay);

const textOverlay2 = document.createElement("div");
textOverlay2.className = "text-overlay2";
textOverlay2.innerHTML = `
  <div class="text-content2">
    <a href="https://www.instagram.com/kiki100nyc/" target="_blank" class="text-line-3">see more at @kiki100nyc</a>
  </div>
`;
videoContainer.appendChild(textOverlay2);
// 创建遮罩层（用于变暗效果）
const darkOverlay = document.createElement("div");
darkOverlay.className = "dark-overlay";
videoContainer.appendChild(darkOverlay);

// 创建 "Click around!" 文案
const clickHint = document.createElement("div");
clickHint.className = "click-hint";
clickHint.textContent = "Click around!";
app.appendChild(clickHint);

// 创建返回按钮
const backButton = document.createElement("button");
backButton.className = "back-button";
backButton.textContent = "← Back";
app.appendChild(backButton);

// 创建背景音乐元素
const backgroundMusic = document.createElement("audio");
backgroundMusic.src = bgMusic;
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3; // 设置音量为30%

// 创建音乐控制按钮
const musicToggle = document.createElement("button");
musicToggle.className = "music-toggle";
app.appendChild(musicToggle);

// 创建场景
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x000000);
// const light = new THREE.AmbientLight(0x404040, 5); // soft white light
// scene.add(light);
// 用于放置多个模型的父级分组
// const modelsGroup = new THREE.Group();
// scene.add(modelsGroup);

// 创建相机
const camera = new THREE.PerspectiveCamera(
  45, // 视野角度
  window.innerWidth / window.innerHeight, // 宽高比
  1, // 近裁剪面
  1000 // 远裁剪面
);
// const originalCameraPosition = {
//   x: -7.5909703385404885,
//   y: 1.613076781146983,
//   z: 39.49155677332778,
// };
const originalCameraPosition = {
  x: -8.05026401650122,
  y: 0.9654609201973157,
  z: 45.40329366852605,
};
// const originalControlsTarget = {
//   x: -2.033064258871486,
//   y: 0.3469622435457361,
//   z: -0.3729618173564209,
// };
const originalControlsTarget = {
  x: -1.6749705952156946,
  y: 0.4272720408585716,
  z: -0.3239999328506802,
};
camera.position.set(
  originalCameraPosition.x,
  originalCameraPosition.y,
  originalCameraPosition.z
);

//CREATE A GLOBALLY ACCESSIBLE OBJECT TO HOLD ONTO ALL OF OUR MESHES
const meshes = {};
const lights = {};
const mixers = [];
// const controls = new OrbitControls(camera, renderer.domElement)

const clock = new THREE.Clock();
// const loadingManager = manager();
// Car positions in order: car3, car2, car1, car5, car4 (starting from car3)
let composer = null;

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// renderer.logarithmicDepthBuffer = true;
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1;
renderer.domElement.className = "threejs-canvas";
renderer.domElement.style.opacity = "0";
app.appendChild(renderer.domElement);

scene.background = HDRI();
scene.backgroundIntensity = 0.45;

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
// controls.enablePan = false;
// controls.enableZoom = false;
// controls.enableRotate = false;
controls.dampingFactor = 0.05;
controls.target.set(
  originalControlsTarget.x,
  originalControlsTarget.y,
  originalControlsTarget.z
);
//CALL OUR INIT FUNCTION, OUR SETUP BASICALLY
init();
function init() {
  //DEFAULT SETTINGS FOR OUR RENDERER, WE WANT TO SET THE SIZE OF OUR RENDERER OUTPUT TO BE THE SAME SIZE AND RATIO AS OUR WINDOW
  //WE ALSO WANT OUR RENDERER TO OUTPUT TO OUR WEBPAGE
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);

  //WE WILL ADD ANY AND ALL 3D MESHES TO OUR GLOBAL MESHES OBJECT HERE
  //axesHelper
  // const axesHelper = new THREE.AxesHelper(50);
  // scene.add(axesHelper);
  //Lights
  // lights.default = addLight()
  lights.top = addTopLight();
  scene.add(lights.top);
  const helper = new THREE.DirectionalLightHelper(lights.top, 5);
  //   scene.add(helper);
  //   lights.back = addBackLight();
  //   scene.add(lights.back);
  //   const helper2 = new THREE.DirectionalLightHelper(lights.back, 5);
  //   scene.add(helper2);
  lights.right = addRightLight();
  scene.add(lights.right);
  const helper3 = new THREE.DirectionalLightHelper(lights.right, 5);
  //   scene.add(helper3);
  lights.left = addLeftLight();
  scene.add(lights.left);
  const helper4 = new THREE.DirectionalLightHelper(lights.left, 5);
  // scene.add(helper4);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(box, material);
  scene.add(cube);
  cube.visible = false;
  cube.position.set(0, 25, 0);
  lights.bottom = addCeilingLight();
  lights.bottom.target = cube;
  scene.add(lights.bottom);
  const helper5 = new THREE.DirectionalLightHelper(lights.bottom, 5);
  // scene.add(helper5);
  //HERE WE'LL ADD EACH OBJECT TO OUR SCENE AS WELL
  // scene.add(lights.default)
  composer = postprocessing(scene, camera, renderer);

  //START OUR ANIMATION LOOP
  instances();
  // scene.traverse((child) => {
  //   console.log(child, 4444);
  //   if (child.isMesh && child.material.name === "lights") {
  //     child.material.emissive = new THREE.Color(0xffffff);
  //     child.material.needsUpdate = true;
  //     console.log(7676767);
  //   }
  // });
  // scene.getObjectByName("Lights_lights_0").material.emissive = new THREE.Color(0xffffff);
  resize();
  animate();
}
let train = null;
let shoes = null;
function instances() {
  const Bagel = new Model({
    name: "car1",
    url: "test6.glb",
    meshes: meshes,
    scene: scene,
    scale: new THREE.Vector3(0.1, 0.1, 0.1),
    position: new THREE.Vector3(0, -8, 50),
    // manager: loadingManager,
  });
  Bagel.init();
  // const car2 = new Model2({
  //   name: "car2",
  //   url: "1.glb",
  //   meshes: meshes,
  //   scene: scene,
  //   scale: new THREE.Vector3(5, 5, 5),
  //   position: new THREE.Vector3(3, -7, -15),
  // });
  // car2.init();
  // const car3 = new Model2({
  //   name: "car3",
  //   url: "2.glb",
  //   meshes: meshes,
  //   scene: scene,
  //   scale: new THREE.Vector3(1,1,1),
  //   position: new THREE.Vector3(-15, -2, -25),
  // });
  // car3.init();
  // const car4 = new Model2({
  //   name: "car4",
  //   url: "4.glb",
  //   meshes: meshes,
  //   scene: scene,
  //   scale: new THREE.Vector3(0.1, 0.1, 0.1),
  //   position: new THREE.Vector3(-15, -4, -35),
  // });
  // car4.init();
}
// 加载模型
// const loader = new GLTFLoader();
// loader.load("/model/1.glb", (gltf) => {
//   // 计算模型包围盒
//   const box = new THREE.Box3().setFromObject(gltf.scene);
//   const center = new THREE.Vector3();
//   box.getCenter(center);

//   // 将原始模型移到其包围盒中心为坐标原点的位置（作为模板）
//   gltf.scene.position.sub(center); // 模型的本地原点移动到包围盒中心
//   gltf.scene.scale.set(2, 2, 2);
//   // 复制 7 个模型，围成一圈
//   const count = 7;
//   const radius = 4; // 半径决定模型之间的间距
//   const angleStep = (Math.PI * 2) / count;

//   for (let i = 0; i < count; i++) {
//     // 深度克隆模型
//     const modelClone = gltf.scene.clone(true);

//     // 为每个模型创建一个独立的分组，方便控制位置和朝向
//     const modelGroup = new THREE.Group();
//     modelGroup.add(modelClone);

//     const angle = i * angleStep;
//     const x = Math.cos(angle) * radius;
//     const z = Math.sin(angle) * radius;

//     // 设置每个模型在圆上的位置
//     modelGroup.position.set(x, 0, z);

//     // 让模型面向圆心
//     modelGroup.lookAt(0, 0, 0);

//     modelsGroup.add(modelGroup);
//   }
// });
// 转场状态
let isTransitioning = false;
// 定时器引用，用于清除
let darkOverlayTimer = null;
let transitionTimer = null;
let hideVideoTimer = null;

// 显示 "Click around!" 文案和返回按钮的函数
function showClickHintAndBackButton() {
  // 显示 "Click around!" 文案
  clickHint.classList.add("visible");
  clickHint.classList.add("blinking");

  // 闪烁动画持续 2 秒，之后隐藏文案
  setTimeout(() => {
    clickHint.classList.remove("visible", "blinking");
  }, 2000);

  // 显示返回按钮和音乐控制按钮
  setTimeout(() => {
    backButton.classList.add("visible");
    musicToggle.classList.add("visible");
  }, 200);

  // 播放背景音乐
  backgroundMusic.play().catch((err) => {
    console.error("背景音乐播放失败:", err);
  });
}

// 返回按钮点击事件 - 恢复到初始视频状态
backButton.addEventListener("click", () => {
  // 清除所有转场相关的定时器
  if (darkOverlayTimer) clearTimeout(darkOverlayTimer);
  if (transitionTimer) clearTimeout(transitionTimer);
  if (hideVideoTimer) clearTimeout(hideVideoTimer);
  darkOverlayTimer = null;
  transitionTimer = null;
  hideVideoTimer = null;

  // 隐藏返回按钮和音乐控制按钮
  backButton.classList.remove("visible");
  musicToggle.classList.remove("visible");

  // 暂停并重置背景音乐
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  musicToggle.classList.remove("muted");

  // 隐藏 three.js 场景
  renderer.domElement.style.transition = "opacity 1s ease-in-out";
  renderer.domElement.style.opacity = "0";

  // 重置遮罩层 - 先移除类，然后强制重排
  darkOverlay.classList.remove("active");
  // 强制重排以确保状态完全重置
  void darkOverlay.offsetWidth;

  // 重置并显示视频容器
  videoContainer.style.display = "block";
  videoContainer.classList.remove("fade-out");
  videoContainer.style.opacity = "1";

  // 重置视频到起始位置
  video.currentTime = 0;
  video.pause();

  // 重置文字覆盖层 - 先移除所有类，强制重排，然后重新添加
  textOverlay.classList.remove("zooming", "blinking");
  void textOverlay.offsetWidth; // 强制重排
  textOverlay.classList.add("blinking");

  // 重置转场状态
  isTransitioning = false;
});

// 音乐控制按钮点击事件 - 切换音乐播放/暂停
musicToggle.addEventListener("click", () => {
  if (backgroundMusic.paused) {
    backgroundMusic.play().catch((err) => {
      console.error("背景音乐播放失败:", err);
    });
    musicToggle.classList.remove("muted");
  } else {
    backgroundMusic.pause();
    musicToggle.classList.add("muted");
  }
});

// 文字闪烁动画
function startTextBlink() {
  textOverlay.classList.add("blinking");
}

// 点击文字开始转场
textOverlay.addEventListener("click", () => {
  if (isTransitioning) return;
  isTransitioning = true;

  // 移除闪烁效果
  textOverlay.classList.remove("blinking");
  textOverlay.classList.add("zooming");

  // 开始播放视频
  video.play().catch((err) => {
    console.error("视频播放失败:", err);
  });

  // 延迟后开始变暗（在文字移动和放大过程中）
  setTimeout(() => {
    darkOverlay.classList.add("active");
  }, 4000); // 在5秒转场开始前1秒开始变暗

  // 转场到 three.js 场景（5秒后开始）
  setTimeout(() => {
    videoContainer.classList.add("fade-out");
    renderer.domElement.style.transition = "opacity 2s ease-in-out";
    renderer.domElement.style.opacity = "1";

    // 转场完成后隐藏视频层（2秒后）
    setTimeout(() => {
      videoContainer.style.display = "none";
      video.pause();

      // 转场完成后显示 "Click around!" 文案和返回按钮
      showClickHintAndBackButton();
    }, 2000);
  }, 5000);
});

// 加载视频封面
video.addEventListener("loadedmetadata", () => {
  // 视频元数据加载完成后，设置到第一帧显示封面
  video.currentTime = 0;
});

video.addEventListener("loadeddata", () => {
  // 视频数据加载完成后开始闪烁文字
  startTextBlink();
});

// 确保视频封面显示
video.addEventListener("seeked", () => {
  // 当视频跳转到指定时间后，确保显示封面
  if (video.currentTime === 0 && video.paused) {
    startTextBlink();
  }
});

// 添加网格辅助线

// const axesHelper = new THREE.AxesHelper(10);
// scene.add(axesHelper);

// 打开自定义内容的新标签页
function openCustomPage(parentName) {
  // 从parent名称中提取数字，如 "1glb" -> "1"
  const pageNumber = parentName.replace("glb", "");
  // 根据数字动态构建页面路径
  const pageUrl = `./src/page${pageNumber}/index.html`;
  window.open(pageUrl, "_blank");
  // 暂停背景音乐
  backgroundMusic.pause();
}

// 射线拾取：用于点击模型
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 允许交互的模型name列表
const allowedNames = ["1glb", "2glb", "3glb", "4glb", "5glb", "6glb", "7glb"];

// 相机动画状态
let cameraAnimating = false;
let currentHoveredModel = null;
let cameraAnimation = null;
let controlsAnimation = null;
let hoverStayTimer = null; // 停顿计时器
let timerStarted = false; // 标记计时器是否已经启动
const HOVER_STAY_DURATION = 2000; // 停顿时长（毫秒）

// 查找对象的允许parent
function findAllowedParent(object) {
  let currentObject = object;
  while (currentObject) {
    console.log("Checking object name:", currentObject.name, "| Type:", currentObject.type); // 调试信息
    if (allowedNames.includes(currentObject.name)) {
      console.log("Found allowed parent:", currentObject.name); // 调试信息
      return currentObject;
    }
    currentObject = currentObject.parent;
  }
  console.log("No allowed parent found"); // 调试信息
  return null;
}

// 相机移动到模型附近
function moveCameraToModel(modelObject) {
  if (cameraAnimating) {
    // 如果正在动画中，不执行新的动画
    return;
  }

  cameraAnimating = true;
  currentHoveredModel = modelObject;

  // 根据模型name获取对应的锚点索引
  const modelIndex = allowedNames.indexOf(modelObject.name);
  if (modelIndex === -1 || modelIndex >= aimPointList.length) {
    console.warn(`Model ${modelObject.name} not found in allowed names or no corresponding aim point`);
    cameraAnimating = false;
    return;
  }

  // 获取对应的锚点坐标
  const targetAimPoint = aimPointList[modelIndex];
  const targetCameraPosition = targetAimPoint.cameraPos;
  const targetControlsPosition = targetAimPoint.controlsTar;

  // 使用gsap动画移动相机和控制器
  cameraAnimation = gsap.to(camera.position, {
    x: targetCameraPosition.x,
    y: targetCameraPosition.y,
    z: targetCameraPosition.z,
    duration: 1.5,
    ease: "power2.inOut",
  });

  controlsAnimation = gsap.to(controls.target, {
    x: targetControlsPosition.x,
    y: targetControlsPosition.y,
    z: targetControlsPosition.z,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => {
      controls.update();
    },
    onComplete: () => {
      cameraAnimating = false;
      console.log("Camera animation completed, model:", currentHoveredModel?.name);
      // 动画完成后，不再立即检查，而是在鼠标移动事件中延迟检查
    },
  });
}

// 相机返回初始位置
function resetCamera() {
  if (cameraAnimating) {
    // 如果正在动画中，不执行新的动画
    return;
  }

  cameraAnimating = true;
  currentHoveredModel = null;

  cameraAnimation = gsap.to(camera.position, {
    x: originalCameraPosition.x,
    y: originalCameraPosition.y,
    z: originalCameraPosition.z,
    duration: 1.5,
    ease: "power2.inOut",
  });

  controlsAnimation = gsap.to(controls.target, {
    x: originalControlsTarget.x,
    y: originalControlsTarget.y,
    z: originalControlsTarget.z,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => {
      controls.update();
    },
    onComplete: () => {
      cameraAnimating = false;
    },
  });
}
const aimPointList = [
  {
    cameraPos: {
      x: -8.84133050940818,
      y: -0.15085584631046345,
      z: 28.726136842222772,
    },
    controlsTar: {
      x: -21.474445594177123,
      y: -6.938334837880749,
      z: 8.309682794190072,
    },
  },
  {
    cameraPos: {
      x: 2.174742671100911,
      y: 14.491229620239004,
      z: -51.155613738792,
    },
    controlsTar: {
      x: -1.8380931482796188,
      y: 14.724437053057889,
      z: -58.47778699252439,
    },
  },
  {
    cameraPos: {
      x: 7.304506645734044,
      y: 7.095849899629107,
      z: 8.487616363992055,
    },
    controlsTar: {
      x: 50.06145816474451,
      y: 9.602224811316013,
      z: -8.760008840275338,
    },
  },
  {
    cameraPos: {
      x: 2.235985083604393,
      y: -1.5117328445648395,
      z: -22.116750312709247,
    },
    controlsTar: {
      x: 3.5897410731741757,
      y: -1.8822068498811049,
      z: -23.91067877996713,
    },
  },
  {
    cameraPos: {
      x: 2.8723636800499612,
      y: 0.06395910682135053,
      z: -46.661116140696556,
    },
    controlsTar: {
      x: -5.1244524209959685,
      y: -5.076432020957328,
      z: -64.62231269817825,
    },
  },
  {
    cameraPos: {
      x: 13.27290968255592,
      y: 8.202578049968306,
      z: -20.50398689078158,
    },
    controlsTar: {
      x: 49.468901705029545,
      y: 6.936469589421419,
      z: -38.10854139678713,
    },
  },
  {
    cameraPos: {
      x: 8.864522730320381,
      y: -0.33729229087212964,
      z: 28.209153408294775,
    },
    controlsTar: {
      x: 62.94904398993956,
      y: -15.358766086878651,
      z: -20.812311434720975,
    },
  },
];
// 鼠标移动事件监听器
renderer.domElement.addEventListener("mousemove", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const hoveredObject = intersects[0].object;
    const allowedParent = findAllowedParent(hoveredObject);

    if (allowedParent) {
      // 清除之前的计时器
      if (hoverStayTimer) {
        console.log("Mouse back on model, clearing timer"); // 调试信息
        clearTimeout(hoverStayTimer);
        hoverStayTimer = null;
        timerStarted = false;
      }

      // 悬浮在允许的模型上，只有在没有动画时才触发
      if (currentHoveredModel !== allowedParent && !cameraAnimating) {
        moveCameraToModel(allowedParent);
      } else if (!cameraAnimating) {
        // 更新当前悬浮的模型
        currentHoveredModel = allowedParent;
      }
      return;
    }
  }

  // 鼠标不在任何允许的模型上
  if (currentHoveredModel !== null && !cameraAnimating && !timerStarted) {
    console.log("Mouse left model, starting timer..."); // 调试信息
    timerStarted = true;

    // 设置延迟计时器，2秒后才返回初始位置
    hoverStayTimer = setTimeout(() => {
      console.log("Timer triggered, resetting camera..."); // 调试信息
      currentHoveredModel = null;
      resetCamera();
      hoverStayTimer = null;
      timerStarted = false;
    }, HOVER_STAY_DURATION);
  } else if (cameraAnimating) {
    // 如果正在动画中，只更新状态，不触发新动画
    // 清除计时器，因为动画还在进行
    if (hoverStayTimer) {
      clearTimeout(hoverStayTimer);
      hoverStayTimer = null;
      timerStarted = false;
    }
  }
});

// 点击 three.js 画布时，检测是否点到了模型
renderer.domElement.addEventListener("click", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  // 将鼠标坐标转换为标准设备坐标 (NDC)
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  // 与场景中的所有子对象进行相交测试（递归检测）
  const intersects = raycaster.intersectObjects(scene.children, true);
  console.log("触发了", intersects.length);
  if (intersects.length > 0) {
    // 获取被点击的对象
    const clickedObject = intersects[0].object;
    const allowedParent = findAllowedParent(clickedObject);

    // 只有当找到允许的parent时才打开新标签页
    if (allowedParent) {
      // 将parent名称传递给openCustomPage函数
      openCustomPage(allowedParent.name);
      console.log("Clicked position:", intersects[0]);
      console.log("Clicked model:", allowedParent.name);
    } else {
      console.log("Clicked object parent not in allowed list");
    }
  }
});

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 更新控制器
  controls.update();

  // 让所有模型围成的组缓慢自转
  // modelsGroup.rotation.y += 0.005;

  // 使用后处理渲染
  composer.composer.render();

  //渲染器渲染
  // renderer.render(scene, camera);
}

// // 处理窗口大小变化
// window.addEventListener("resize", () => {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   // composer.setSize(window.innerWidth, window.innerHeight);
// });
function resize() {
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    if (composer) {
      composer.composer.setSize(window.innerWidth, window.innerHeight);
      if (composer.smaa) {
        composer.smaa.setSize(window.innerWidth, window.innerHeight);
      }
    }
  });
}
// 启动动画
animate();

window.addEventListener("dblclick", (event) => {
  console.log(camera.position);
  console.log(controls.target);
});
