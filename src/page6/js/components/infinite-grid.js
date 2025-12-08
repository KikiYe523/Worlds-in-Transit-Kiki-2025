import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
gsap.registerPlugin(SplitText);
import bg from "../../../static/img/page6/bg6.MP4";
export default class InfiniteGrid {
  constructor({ el, sources, data, originalSize }) {
    this.$container = el;
    this.sources = sources;
    this.data = data;
    this.originalSize = originalSize;

    this.scroll = {
      ease: 0.06,
      current: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      last: { x: 0, y: 0 },
      delta: { x: { c: 0, t: 0 }, y: { c: 0, t: 0 } },
    };

    this.isDragging = false;
    this.drag = { startX: 0, startY: 0, scrollX: 0, scrollY: 0 };

    this.mouse = {
      x: { t: 0.5, c: 0.5 },
      y: { t: 0.5, c: 0.5 },
      press: { t: 0, c: 0 },
    };

    this.items = [];
    this.modelItems = [];

    // Detail panel state
    this.detailPanel = null;
    this.closeButton = null;
    this.isDetailOpen = false;
    this.activeItem = null;
    this.activeItemOriginalState = null;
    this.isAnimating = false; // Animation lock to prevent rapid clicks
    this.textAnimations = null; // Store text animations for cleanup

    this.onResize = this.onResize.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.render = this.render.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.onPanelMouseLeave = this.onPanelMouseLeave.bind(this);
    this.onCloseButtonClick = this.onCloseButtonClick.bind(this);

    window.addEventListener("resize", this.onResize);
    window.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("mousemove", this.onMouseMove);
    this.$container.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("visible", entry.isIntersecting);
      });
    });

    // 创建视频背景
    this.createVideoBackground();

    this.onResize();
    this.render();
    this.initIntro();
    this.intro();
    this.createDetailPanel();
  }

  /**
   * 为某个容器创建 3D 模型渲染（model 类型元素）
   * src 建议使用 public 下的路径，例如：/model/cat.glb
   */
  createModelInItem(container, src) {
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // 暂时使用不透明背景，方便观察模型
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // 不透明深色背景，先确保模型光照与轮廓清晰
    // renderer.setClearColor(0x000000, 1);

    container.appendChild(renderer.domElement);

    // 轨道控制器，方便交互查看模型
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1;
    controls.maxDistance = 10;

    // 顶部环境光，稍微偏蓝/灰，柔和整体亮度
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    scene.add(hemiLight);

    // 主方向光，提供清晰的高光和阴影
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(2, 5, 5);
    dirLight.castShadow = false;
    scene.add(dirLight);

    // 轻微的背光，避免完全黑面
    const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
    backLight.position.set(-3, -2, -3);
    scene.add(backLight);

    // 坐标轴辅助器（如需调试可再次开启）
    // const axesHelper = new THREE.AxesHelper(1);
    // scene.add(axesHelper);

    const modelInfo = {
      scene,
      camera,
      renderer,
      controls,
      axesHelper: null,
      model: null,
    };

    console.log("[InfiniteGrid] start loading model:", src);

    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        console.log("[InfiniteGrid] model loaded:", src);
        const model = gltf.scene;

        // 把模型包装到一个 pivot 组里，确保 pivot 的原点就是模型包围盒中心
        const pivot = new THREE.Group();
        scene.add(pivot);
        pivot.add(model);

        // 以包围盒中心为基准，将模型中心对齐到 pivot 原点 (0,0,0)
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center); // 模型几何中心移到 pivot (0,0,0)

        // 重新根据居中后的模型计算尺寸并按视锥体大小等比缩放
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxSize = Math.max(size.x, size.y, size.z);
        const dist = camera.position.length();
        const fov = (camera.fov * Math.PI) / 180;
        const targetSize = Math.tan(fov / 2) * dist * 2;
        const scale = (targetSize * 0.6) / maxSize; // 0.6 留点边距
        pivot.scale.setScalar(scale);

        // 确保 pivot 本身就在 (0,0,0)
        pivot.position.set(0, 0, 0);

        modelInfo.model = pivot;
      },
      undefined,
      (error) => {
        console.error("[InfiniteGrid] Error loading model:", src, error);
      }
    );

    return modelInfo;
  }

  createVideoBackground() {
    // 创建视频元素
    this.videoBg = document.createElement("video");
    this.videoBg.src = bg;
    this.videoBg.className = "hero-background-video";
    this.videoBg.autoplay = true;
    this.videoBg.loop = true;
    this.videoBg.muted = false;
    this.videoBg.playsInline = true;
    this.videoBg.preload = "auto";
    this.videoBg.volume = 0.3; // 设置音量为30%

    // 将视频添加到容器的最前面（作为背景层）
    this.$container.insertBefore(this.videoBg, this.$container.firstChild);
  }

  initIntro() {
    this.introItems = [
      ...this.$container.querySelectorAll(".item-wrapper"),
    ].filter((item) => {
      const rect = item.getBoundingClientRect();
      return (
        rect.x > -rect.width &&
        rect.x < window.innerWidth + rect.width &&
        rect.y > -rect.height &&
        rect.y < window.innerHeight + rect.height
      );
    });
    this.introItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const x = -rect.x + window.innerWidth * 0.5 - rect.width * 0.5;
      const y = -rect.y + window.innerHeight * 0.5 - rect.height * 0.5;
      gsap.set(item, { x, y });
    });
  }

  intro() {
    gsap.to(this.introItems.reverse(), {
      duration: 2,
      ease: "expo.inOut",
      x: 0,
      y: 0,
      stagger: 0.05,
    });
  }

  onResize() {
    this.winW = window.innerWidth;
    this.winH = window.innerHeight;

    // 使用原始尺寸，不进行缩放
    this.tileSize = {
      w: this.originalSize.w,
      h: this.originalSize.h,
    };

    this.scroll.current = { x: 0, y: 0 };
    this.scroll.target = { x: 0, y: 0 };
    this.scroll.last = { x: 0, y: 0 };

    // 保存视频背景元素（如果存在）
    const videoBg = this.$container.querySelector(".hero-background-video");
    this.$container.innerHTML = "";

    // 重新添加视频背景
    if (videoBg) {
      this.$container.insertBefore(videoBg, this.$container.firstChild);
    } else if (this.videoBg) {
      this.$container.insertBefore(this.videoBg, this.$container.firstChild);
    }

    // 工具函数：把源码里相对路径（如 "../../static/img/...") 转成运行时可访问路径
    const resolveAssetSrc = (src) => {
      if (typeof src !== "string") return src;
      // 你的源数据目前是 "../../static/img/page1/xxx"
      // 页面实际 URL 形如 "/src/page1/index.html"，所以需要补上 "/src"
      if (src.startsWith("../../static/")) {
        return src.replace("../../", "/src/");
      }
      return src;
    };

    const baseItems = this.data.map((d, i) => {
      // 不使用缩放，直接使用原始尺寸
      const source = this.sources[i % this.sources.length];

      // 如果没有显式声明 type，则根据扩展名推断是否为视频
      let inferredType = "image";
      if (!source.type && typeof source.src === "string") {
        const lower = source.src.toLowerCase();
        if (
          lower.endsWith(".mp4") ||
          lower.endsWith(".webm") ||
          lower.endsWith(".mov")
        ) {
          inferredType = "video";
        }
      }

      return {
        type: source.type || inferredType, // 优先显式 type，其次按扩展名推断
        src: resolveAssetSrc(source.src),
        caption: source.caption,
        x: d.x,
        y: d.y,
        w: d.w,
        h: d.h,
      };
    });

    this.items = [];
    this.modelItems = [];
    const repsX = [0, this.tileSize.w];
    const repsY = [0, this.tileSize.h];

    baseItems.forEach((base) => {
      repsX.forEach((offsetX) => {
        repsY.forEach((offsetY) => {
          const el = document.createElement("div");
          el.classList.add("item");
          el.style.width = `${base.w}px`;

          const wrapper = document.createElement("div");
          wrapper.classList.add("item-wrapper");
          el.appendChild(wrapper);

          const itemImage = document.createElement("div");
          itemImage.classList.add("item-image");
          itemImage.style.width = `${base.w}px`;
          itemImage.style.height = `${base.h}px`;
          wrapper.appendChild(itemImage);

          let img = null;
          let videoEl = null;
          let modelInfo = null;

          if (base.type === "model") {
            // model 类型：渲染 GLB 模型
            modelInfo = this.createModelInItem(itemImage, base.src);
            this.modelItems.push(modelInfo);
          } else if (base.type === "video") {
            // video 类型：仅展示首帧作为封面，点击后再播放
            videoEl = document.createElement("video");
            videoEl.src = base.src; // 已在 baseItems 中通过 resolveAssetSrc 处理
            videoEl.autoplay = false;
            videoEl.loop = true;
            videoEl.muted = true; // 静音，便于静默播放一帧
            videoEl.playsInline = true;
            videoEl.preload = "auto"; // 改回 auto 以确保加载足够的数据
            videoEl.classList.add("item-video");

            console.log(
              "[InfiniteGrid] Creating video element with src:",
              base.src
            );

            itemImage.appendChild(videoEl);

            // 加载完数据后，静默播放并立即暂停，以强制渲染首帧为封面
            const showFirstFrame = () => {
              console.log(
                "[InfiniteGrid] showFirstFrame called, readyState:",
                videoEl.readyState
              );

              // 确保视频有数据可以渲染
              if (videoEl.readyState >= 2) {
                // HAVE_CURRENT_DATA or higher
                console.log(
                  "[InfiniteGrid] Video ready, attempting to show first frame"
                );

                // 尝试播放并立即暂停，确保首帧渲染
                const playPromise = videoEl.play();
                if (playPromise && typeof playPromise.then === "function") {
                  playPromise
                    .then(() => {
                      console.log(
                        "[InfiniteGrid] Video played successfully, pausing now"
                      );
                      // 播放成功后立即暂停在第一帧
                      setTimeout(() => {
                        videoEl.pause();
                        try {
                          videoEl.currentTime = 0.1;
                        } catch (_) {}
                      }, 50);
                    })
                    .catch((err) => {
                      console.error("[InfiniteGrid] Video play failed:", err);
                      // 播放被拦截，尝试直接设置帧
                      try {
                        videoEl.currentTime = 0.1;
                      } catch (_) {}
                    });
                } else {
                  console.log(
                    "[InfiniteGrid] No promise returned, pausing directly"
                  );
                  videoEl.pause();
                }
              } else {
                console.log(
                  "[InfiniteGrid] Video not ready yet, readyState:",
                  videoEl.readyState
                );
              }
            };

            // 监听错误事件
            videoEl.addEventListener("error", (e) => {
              console.error("[InfiniteGrid] Video loading error:", {
                src: base.src,
                error: e,
                videoError: videoEl.error,
              });
            });

            // 使用多个事件确保能捕获到加载完成
            videoEl.addEventListener(
              "loadedmetadata",
              () => {
                console.log(
                  "[InfiniteGrid] loadedmetadata event fired for:",
                  base.src
                );
              },
              { once: true }
            );

            videoEl.addEventListener(
              "loadeddata",
              () => {
                console.log(
                  "[InfiniteGrid] loadeddata event fired for:",
                  base.src
                );
                showFirstFrame();
              },
              { once: true }
            );

            videoEl.addEventListener(
              "canplay",
              () => {
                console.log(
                  "[InfiniteGrid] canplay event fired for:",
                  base.src
                );
              },
              { once: true }
            );

            // 如果视频已经加载完成，立即执行
            setTimeout(() => {
              if (videoEl.readyState >= 2) {
                console.log(
                  "[InfiniteGrid] Video already loaded, showing first frame immediately"
                );
                showFirstFrame();
              }
            }, 100);

            // 创建中心的播放按钮覆盖层
            const playBtn = document.createElement("button");
            playBtn.className = "item-video-play";
            playBtn.type = "button";
            playBtn.innerHTML = "▶";
            itemImage.appendChild(playBtn);

            // 点击按钮播放/暂停视频，并切换按钮可见性
            // playBtn.addEventListener("click", (e) => {
            //   e.stopPropagation();
            //   if (videoEl.paused) {
            //     videoEl.play().then(
            //       () => {
            //         playBtn.classList.add("is-hidden");
            //       },
            //       () => {
            //         // 播放失败时保持按钮可见
            //       }
            //     );
            //   } else {
            //     videoEl.pause();
            //     playBtn.classList.remove("is-hidden");
            //   }
            // });
          } else {
            // 默认：图片类型
            img = new Image();
            img.src = base.src; // 已在 baseItems 中通过 resolveAssetSrc 处理
            itemImage.appendChild(img);
          }

          // const caption = document.createElement("small");
          // caption.innerHTML = base.caption;
          // const split = new SplitText(caption, {
          //   type: "lines",
          //   mask: "lines",
          //   linesClass: "line",
          // });
          // split.lines.forEach((line, i) => {
          //   line.style.transitionDelay = `${i * 0.15}s`;
          //   line.parentElement.style.transitionDelay = `${i * 0.15}s`;
          // });
          // wrapper.appendChild(caption);
          this.$container.appendChild(el);
          // this.observer.observe(caption);

          // Store detail and caption data
          const itemData = {
            el,
            container: itemImage,
            wrapper,
            img,
            video: videoEl,
            modelInfo,
            x: base.x + offsetX,
            y: base.y + offsetY,
            w: base.w,
            h: base.h,
            extraX: 0,
            extraY: 0,
            rect: el.getBoundingClientRect(),
            ease: Math.random() * 0.5 + 0.5,
            detail:
              this.sources[
                this.data.findIndex((d) => d.x === base.x && d.y === base.y)
              ].detail,
            caption: base.caption,
            type: base.type,
          };

          // Add click event listener for each item - bind to itemImage instead of wrapper
          itemImage.addEventListener("click", (e) => {
            e.stopPropagation();
            this.onItemClick(itemData);
          });

          this.items.push(itemData);
        });
      });
    });

    this.tileSize.w *= 2;
    this.tileSize.h *= 2;

    this.scroll.current.x =
      this.scroll.target.x =
      this.scroll.last.x =
        -this.winW * 0.1;
    this.scroll.current.y =
      this.scroll.target.y =
      this.scroll.last.y =
        -this.winH * 0.1;
  }

  onWheel(e) {
    // Prevent wheel scrolling during animation
    if (this.isAnimating) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const factor = 0.4;
    this.scroll.target.x -= e.deltaX * factor;
    this.scroll.target.y -= e.deltaY * factor;
  }

  onMouseDown(e) {
    // Prevent dragging during animation
    if (this.isAnimating) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    this.isDragging = true;
    document.documentElement.classList.add("dragging");
    this.mouse.press.t = 1;
    this.drag.startX = e.clientX;
    this.drag.startY = e.clientY;
    this.drag.scrollX = this.scroll.target.x;
    this.drag.scrollY = this.scroll.target.y;
  }

  onMouseUp() {
    this.isDragging = false;
    document.documentElement.classList.remove("dragging");
    this.mouse.press.t = 0;
  }

  onMouseMove(e) {
    // this.mouse.x.t = e.clientX / this.winW;
    // this.mouse.y.t = e.clientY / this.winH;

    if (this.isDragging) {
      const dx = e.clientX - this.drag.startX;
      const dy = e.clientY - this.drag.startY;
      this.scroll.target.x = this.drag.scrollX + dx;
      this.scroll.target.y = this.drag.scrollY + dy;
    }
  }

  render() {
    this.scroll.current.x +=
      (this.scroll.target.x - this.scroll.current.x) * this.scroll.ease;
    this.scroll.current.y +=
      (this.scroll.target.y - this.scroll.current.y) * this.scroll.ease;

    this.scroll.delta.x.t = this.scroll.current.x - this.scroll.last.x;
    this.scroll.delta.y.t = this.scroll.current.y - this.scroll.last.y;
    this.scroll.delta.x.c +=
      (this.scroll.delta.x.t - this.scroll.delta.x.c) * 0.04;
    this.scroll.delta.y.c +=
      (this.scroll.delta.y.t - this.scroll.delta.y.c) * 0.04;
    this.mouse.x.c += (this.mouse.x.t - this.mouse.x.c) * 0.04;
    this.mouse.y.c += (this.mouse.y.t - this.mouse.y.c) * 0.04;
    this.mouse.press.c += (this.mouse.press.t - this.mouse.press.c) * 0.04;

    const dirX = this.scroll.current.x > this.scroll.last.x ? "right" : "left";
    const dirY = this.scroll.current.y > this.scroll.last.y ? "down" : "up";

    this.items.forEach((item) => {
      const newX =
        5 * this.scroll.delta.x.c * item.ease +
        (this.mouse.x.c - 0.5) * item.rect.width * 0.6;
      const newY =
        5 * this.scroll.delta.y.c * item.ease +
        (this.mouse.y.c - 0.5) * item.rect.height * 0.6;
      const scrollX = this.scroll.current.x;
      const scrollY = this.scroll.current.y;
      const posX = item.x + scrollX + item.extraX + newX;
      const posY = item.y + scrollY + item.extraY + newY;

      const beforeX = posX > this.winW;
      const afterX = posX + item.rect.width < 0;
      if (dirX === "right" && beforeX) item.extraX -= this.tileSize.w;
      if (dirX === "left" && afterX) item.extraX += this.tileSize.w;

      const beforeY = posY > this.winH;
      const afterY = posY + item.rect.height < 0;
      if (dirY === "down" && beforeY) item.extraY -= this.tileSize.h;
      if (dirY === "up" && afterY) item.extraY += this.tileSize.h;

      const fx = item.x + scrollX + item.extraX + newX;
      const fy = item.y + scrollY + item.extraY + newY;
      item.el.style.transform = `translate(${fx}px, ${fy}px)`;
      // 图片时可以加一点轻微的缩放/位移效果（如果需要）
      // if (item.img) {
      //   item.img.style.transform = `scale(${
      //     1.02 + 0.08 * this.mouse.press.c * item.ease
      //   }) translate(${-this.mouse.x.c * item.ease * 5}%, ${
      //     -this.mouse.y.c * item.ease * 5
      //   }%)`;
      // }
    });

    // 更新并渲染 3D 模型（自动旋转 & 透明背景）
    this.modelItems.forEach((m) => {
      if (m.controls) {
        m.controls.update();
      }
      if (m.model) {
        m.model.rotation.y += 0.01;
      }
      m.renderer.render(m.scene, m.camera);
    });

    this.scroll.last.x = this.scroll.current.x;
    this.scroll.last.y = this.scroll.current.y;

    requestAnimationFrame(this.render);
  }

  createDetailPanel() {
    // Get hero section
    this.heroSection = document.querySelector("#hero");

    // Create detail panel (initially off-screen to the right)
    this.detailPanel = document.createElement("div");
    this.detailPanel.className = "detail-panel";
    this.detailPanel.style.cssText = `
      position: fixed;
      top: 0;
      right: -50vw;
      width: 50vw;
      height: 100vh;
      background: #f1f1f1;
      z-index: 1000;
      padding: 40px;
      box-sizing: border-box;
      overflow: auto;
    `;

    // Detail text - positioned at top left
    this.detailText = document.createElement("p");
    this.detailText.className = "detail-text";
    this.detailText.style.cssText = `
      position: absolute;
      top: 40px;
      left: 40px;
      right: 40px;
      font-size: 16px;
      line-height: 1.6;
      color: #000000;
      margin: 0;
      opacity: 0;
    `;

    // Center content container - for item and caption (left-right layout)
    this.detailCenterContent = document.createElement("div");
    this.detailCenterContent.className = "detail-center-content";
    this.detailCenterContent.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      gap: 80px;
      width: 90%;
    `;

    // Create item container (for cloned element) - reserve enough space
    this.detailItemContainer = document.createElement("div");
    this.detailItemContainer.className = "detail-item-container";
    this.detailItemContainer.style.cssText = `
      flex: 0 0 400px;
      width: 400px;
      height: 400px;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    // Caption text - positioned next to item
    this.captionText = document.createElement("div");
    this.captionText.className = "caption-text";
    this.captionText.style.cssText = `
      font-size: 18px;
      line-height: 1.8;
      color: #000000;
      text-align: center;
      opacity: 0;
    `;

    this.detailCenterContent.appendChild(this.detailItemContainer);
    this.detailCenterContent.appendChild(this.captionText);

    this.detailPanel.appendChild(this.detailText);
    this.detailPanel.appendChild(this.detailCenterContent);

    // Create close button (initially hidden)
    this.closeButton = document.createElement("button");
    this.closeButton.className = "detail-close-button";
    this.closeButton.innerHTML = "✕";
    this.closeButton.style.cssText = `
      position: fixed;
      width: 80px;
      height: 80px;
      color: black;
      border: none;
      font-size: 48px;
      cursor: pointer;
      z-index: 1001;
      display: none;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      transition: background 0.3s ease;
    `;

    this.closeButton.addEventListener("mouseenter", () => {
      this.closeButton.style.background = "transparent";
    });

    this.closeButton.addEventListener("mouseleave", () => {
      this.closeButton.style.background = "transparent";
    });

    this.closeButton.addEventListener("click", this.onCloseButtonClick);

    // Add panel mouse enter/leave listeners
    this.detailPanel.addEventListener("mouseenter", () => {
      if (this.isDetailOpen) {
        this.closeButton.style.display = "none";
        this.closeButton.style.pointerEvents = "none";
      }
    });

    this.detailPanel.addEventListener("mouseleave", this.onPanelMouseLeave);

    document.body.appendChild(this.detailPanel);
    document.body.appendChild(this.closeButton);
  }

  onItemClick(itemData) {
    // Prevent clicks during animation or when detail is already open
    if (this.isDetailOpen || this.isAnimating) return;

    this.isAnimating = true;

    this.isDetailOpen = true;
    this.activeItem = itemData;

    // 当打开详情时，将背景视频静音
    if (this.videoBg) {
      this.videoBg.volume = 0;
    }

    // Store original position and state
    const itemRect = itemData.wrapper.getBoundingClientRect();
    this.activeItemOriginalState = {
      x: itemRect.left,
      y: itemRect.top,
      width: itemRect.width,
      height: itemRect.height,
      parent: itemData.el,
      scrollX: this.scroll.target.x,
      scrollY: this.scroll.target.y,
    };

    // Disable scrolling during animation
    this.isDragging = false;

    // Get the actual element to clone (img/video/canvas)
    let elementToAnimate = null;
    let elementRect = null;
    let shouldClone = true;
    let isModelType = false;
    let isVideoType = false;

    if (itemData.img) {
      elementToAnimate = itemData.img;
      elementRect = itemData.img.getBoundingClientRect();
    } else if (itemData.video) {
      elementToAnimate = itemData.video;
      elementRect = itemData.video.getBoundingClientRect();
      isVideoType = true;
    } else if (itemData.modelInfo && itemData.modelInfo.renderer) {
      // For model, move the original canvas (don't clone)
      elementToAnimate = itemData.modelInfo.renderer.domElement;
      elementRect = elementToAnimate.getBoundingClientRect();
      isModelType = true;
      shouldClone = false; // Don't clone canvas, move the original
    }

    if (!elementToAnimate || !elementRect) {
      console.error("No element to animate found");
      return;
    }

    // Clone or move the element
    let animatedElement;
    if (shouldClone) {
      animatedElement = elementToAnimate.cloneNode(true);
      animatedElement.style.position = "fixed";
      animatedElement.style.left = `${elementRect.left}px`;
      animatedElement.style.top = `${elementRect.top}px`;
      animatedElement.style.width = `${elementRect.width}px`;
      animatedElement.style.height = `${elementRect.height}px`;
      animatedElement.style.zIndex = "1002";
      animatedElement.style.objectFit = "contain";
      document.body.appendChild(animatedElement);
    } else {
      // For model, directly move the original canvas
      animatedElement = elementToAnimate;

      // Store original styles to restore later
      this.originalCanvasStyles = {
        position: animatedElement.style.position,
        left: animatedElement.style.left,
        top: animatedElement.style.top,
        width: animatedElement.style.width,
        height: animatedElement.style.height,
        zIndex: animatedElement.style.zIndex,
        parent: animatedElement.parentElement,
      };

      animatedElement.style.position = "fixed";
      animatedElement.style.left = `${elementRect.left}px`;
      animatedElement.style.top = `${elementRect.top}px`;
      animatedElement.style.width = `${elementRect.width}px`;
      animatedElement.style.height = `${elementRect.height}px`;
      animatedElement.style.zIndex = "1002";
      document.body.appendChild(animatedElement);
    }

    // Store reference
    this.activeItemClone = animatedElement;
    this.activeItemIsCloned = shouldClone;

    // Hide original item
    itemData.wrapper.style.opacity = "0";

    // Set detail panel content
    this.detailText.textContent = itemData.detail;
    this.captionText.innerHTML = itemData.caption;

    // Split text for animation
    if (this.detailTextSplit) {
      this.detailTextSplit.revert();
    }
    if (this.captionTextSplit) {
      this.captionTextSplit.revert();
    }

    this.detailTextSplit = new SplitText(this.detailText, {
      type: "words,chars",
      wordsClass: "word",
      charsClass: "char",
    });

    this.captionTextSplit = new SplitText(this.captionText, {
      type: "lines,words",
      linesClass: "line",
      wordsClass: "word",
    });

    // Calculate target position by temporarily moving panel to final position
    // Save current panel position
    const currentPanelRight = this.detailPanel.style.right;

    // Temporarily move panel to final position (without animation, off-screen)
    this.detailPanel.style.transition = "none";
    this.detailPanel.style.right = "0";

    // Get the position of detail-item-container
    const containerRect = this.detailItemContainer.getBoundingClientRect();
    const targetX =
      containerRect.left + containerRect.width / 2 - elementRect.width / 2;
    const targetY =
      containerRect.top + containerRect.height / 2 - elementRect.height / 2;

    // Move panel back to starting position
    this.detailPanel.style.right = currentPanelRight;
    // Force reflow to ensure the change takes effect
    this.detailPanel.offsetHeight;
    this.detailPanel.style.transition = "";

    // Create timeline for synchronized animations
    const tl = gsap.timeline();

    // Animate hero section moving left (pushed out)
    tl.to(
      this.heroSection,
      {
        x: "-50vw",
        duration: 2,
        ease: "power2.inOut",
      },
      0
    );

    // Animate panel sliding in from right
    tl.to(
      this.detailPanel,
      {
        right: 0,
        duration: 2,
        ease: "power2.inOut",
      },
      0
    );

    // Animate cloned element moving to pre-calculated target position
    tl.to(
      animatedElement,
      {
        left: targetX,
        top: targetY,
        scale: 1.5,
        duration: 2,
        ease: "power2.inOut",
        onComplete: () => {
          // Move element to detail panel after animation
          animatedElement.style.position = "relative";
          animatedElement.style.left = "auto";
          animatedElement.style.top = "auto";
          this.detailItemContainer.appendChild(animatedElement);

          // Auto-play video if it's a video element
          if (isVideoType && animatedElement.tagName === "VIDEO") {
            animatedElement.play().catch((err) => {
              console.log("Video autoplay failed:", err);
            });
          }

          // Store text animations so we can kill them if closed early
          this.textAnimations = gsap.timeline({
            onComplete: () => {
              // Text animations complete, unlock
              this.isAnimating = false;
            },
          });

          // Animate detail text (top left) - character by character
          gsap.set(this.detailText, { opacity: 1 });
          this.textAnimations.fromTo(
            this.detailTextSplit.chars,
            {
              opacity: 0,
              y: 20,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.05,
              stagger: 0.02,
              ease: "power2.out",
            },
            0
          );

          // Animate caption text (center) - line by line
          gsap.set(this.captionText, { opacity: 1 });
          this.textAnimations.fromTo(
            this.captionTextSplit.lines,
            {
              opacity: 0,
              y: 30,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.15,
              ease: "power2.out",
            },
            0
          );

          // Show close button after animation if mouse is outside panel
          // Use a mousemove event to get current mouse position since this.mouse tracking is disabled
          const checkAndShowCloseButton = (mouseX, mouseY) => {
            const panelRect = this.detailPanel.getBoundingClientRect();

            const isOutsidePanel =
              mouseX < panelRect.left ||
              mouseX > panelRect.right ||
              mouseY < panelRect.top ||
              mouseY > panelRect.bottom;

            if (isOutsidePanel) {
              this.closeButton.style.display = "flex";
              this.closeButton.style.pointerEvents = "auto";
              this.closeButton.style.left = `${mouseX - 40}px`;
              this.closeButton.style.top = `${mouseY - 40}px`;

              // Add mouse tracking
              if (!this.mouseMoveHandler) {
                this.mouseMoveHandler = (event) => {
                  this.closeButton.style.left = `${event.clientX - 40}px`;
                  this.closeButton.style.top = `${event.clientY - 40}px`;
                };
                document.addEventListener("mousemove", this.mouseMoveHandler);
              }
            }
          };

          // Get current mouse position using a one-time event listener
          const getMousePosition = new Promise((resolve) => {
            const handler = (e) => {
              document.removeEventListener("mousemove", handler);
              resolve({ x: e.clientX, y: e.clientY });
            };
            document.addEventListener("mousemove", handler);

            // Fallback: if no mouse movement within 100ms, check center of screen
            setTimeout(() => {
              document.removeEventListener("mousemove", handler);
              resolve({ x: this.winW / 2, y: this.winH / 2 });
            }, 100);
          });

          getMousePosition.then(({ x, y }) => {
            checkAndShowCloseButton(x, y);
          });
        },
      },
      0
    );
  }

  onPanelMouseLeave(e) {
    if (!this.isDetailOpen) return;

    // Show close button and make it follow mouse
    this.closeButton.style.display = "flex";
    this.closeButton.style.pointerEvents = "auto";
    this.closeButton.style.left = `${e.clientX - 40}px`;
    this.closeButton.style.top = `${e.clientY - 40}px`;

    // Add mouse tracking if not already added
    if (!this.mouseMoveHandler) {
      this.mouseMoveHandler = (event) => {
        this.closeButton.style.left = `${event.clientX - 40}px`;
        this.closeButton.style.top = `${event.clientY - 40}px`;
      };
      document.addEventListener("mousemove", this.mouseMoveHandler);
    }
  }

  onCloseButtonClick() {
    // Prevent closing during animation or if not open
    if (!this.isDetailOpen || !this.activeItem || this.isAnimating) return;

    this.isAnimating = true;
    this.isDetailOpen = false;

    // 当关闭详情时，恢复背景视频音量到30%
    if (this.videoBg) {
      this.videoBg.volume = 0.3;
    }

    // Kill any ongoing text animations
    if (this.textAnimations) {
      this.textAnimations.kill();
      this.textAnimations = null;
    }

    // Remove mouse move handler
    if (this.mouseMoveHandler) {
      document.removeEventListener("mousemove", this.mouseMoveHandler);
      this.mouseMoveHandler = null;
    }

    // Hide close button
    this.closeButton.style.display = "none";
    this.closeButton.style.pointerEvents = "none";

    // Animate text exit before moving elements back
    const textExitTl = gsap.timeline({
      onComplete: () => {
        // Move element back to body for animation after text is gone
        if (this.activeItemClone.parentElement === this.detailItemContainer) {
          // Clear all gsap transforms first to get clean positioning
          gsap.set(this.activeItemClone, { clearProps: "transform" });

          const cloneRect = this.activeItemClone.getBoundingClientRect();
          this.activeItemClone.style.position = "fixed";
          this.activeItemClone.style.left = `${cloneRect.left}px`;
          this.activeItemClone.style.top = `${cloneRect.top}px`;
          // Don't reset width/height as they are already set and getBoundingClientRect includes scale effect
          document.body.appendChild(this.activeItemClone);

          // Now set scale to 1.5 after element is repositioned
          gsap.set(this.activeItemClone, { scale: 1.5 });
        }

        // Start panel and item exit animation
        const tl = gsap.timeline({
          onComplete: () => {
            // Show original item
            this.activeItem.wrapper.style.opacity = "1";

            // Handle cleanup based on whether it's cloned or moved
            if (this.activeItemIsCloned) {
              // If it was cloned, just remove it
              if (this.activeItemClone && this.activeItemClone.parentElement) {
                this.activeItemClone.remove();
              }
            } else {
              // If it was moved (model canvas), restore to original position
              if (this.originalCanvasStyles && this.activeItemClone) {
                this.activeItemClone.style.position =
                  this.originalCanvasStyles.position;
                this.activeItemClone.style.left =
                  this.originalCanvasStyles.left;
                this.activeItemClone.style.top = this.originalCanvasStyles.top;
                this.activeItemClone.style.width =
                  this.originalCanvasStyles.width;
                this.activeItemClone.style.height =
                  this.originalCanvasStyles.height;
                this.activeItemClone.style.zIndex =
                  this.originalCanvasStyles.zIndex;

                // Restore to original parent
                if (this.originalCanvasStyles.parent) {
                  this.originalCanvasStyles.parent.appendChild(
                    this.activeItemClone
                  );
                }

                this.originalCanvasStyles = null;
              }
            }

            // Reset text opacity
            this.detailText.style.opacity = "0";
            this.captionText.style.opacity = "0";

            // Revert split text
            if (this.detailTextSplit) {
              this.detailTextSplit.revert();
              this.detailTextSplit = null;
            }
            if (this.captionTextSplit) {
              this.captionTextSplit.revert();
              this.captionTextSplit = null;
            }

            // Clear active item
            this.activeItem = null;
            this.activeItemClone = null;
            this.activeItemOriginalState = null;
            this.activeItemIsCloned = null;

            // Unlock animation after close is complete
            this.isAnimating = false;
          },
        });

        // Animate item back to original position
        tl.to(
          this.activeItemClone,
          {
            left: this.activeItemOriginalState.x,
            top: this.activeItemOriginalState.y,
            scale: 1,
            duration: 2,
            ease: "power2.inOut",
          },
          0
        );

        // Animate hero section moving back to original position
        tl.to(
          this.heroSection,
          {
            x: 0,
            duration: 2,
            ease: "power2.inOut",
          },
          0
        );

        // Animate panel sliding out to right
        tl.to(
          this.detailPanel,
          {
            right: "-50vw",
            duration: 2,
            ease: "power2.inOut",
          },
          0
        );
      },
    });

    // Animate detail text exit (characters fade out)
    if (this.detailTextSplit && this.detailTextSplit.chars) {
      textExitTl.to(
        this.detailTextSplit.chars,
        {
          opacity: 0,
          y: -20,
          duration: 0.03,
          stagger: 0.01,
          ease: "power2.in",
        },
        0
      );
    }

    // Animate caption text exit (lines fade out)
    if (this.captionTextSplit && this.captionTextSplit.lines) {
      textExitTl.to(
        this.captionTextSplit.lines,
        {
          opacity: 0,
          y: -30,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.in",
        },
        0
      );
    }
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("mousemove", this.onMouseMove);
    this.$container.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    this.observer.disconnect();
  }
}
