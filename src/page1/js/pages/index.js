import "../../styles/index.scss";
import "../../styles/pages/index.scss";
import InfiniteGrid from "../components/infinite-grid";

export default class Index {
  constructor() {
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();

    // this.sources = [
    //   {
    //     type: "model",
    //     src: "/model/cat.glb",
    //     detail:
    //       "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
    //     caption:
    //       "Production Fun Fact (Eggs) <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2024",
    //   },
    // ];
    // this.data = [{ x: 0, y: 280, w: 400, h: 270 }];
    this.sources = [
      {
        type: "model",
        src: `${import.meta.env.VITE_MODEL_PATH_PREFIX}/model/cat.glb`,
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        caption:
          "Production Fun Fact (Eggs) <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2024",
      },
      {
        type: "image",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/image-1.jpg",
        caption:
          "30 knots <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2021",
      },
      {
        type: "image",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/image-2.JPG",
        caption:
          "Sad Mis-Step <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2024",
      },
      {
        type: "image",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/image-3.JPG",
        caption:
          "Mini Orange <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2014",
      },
      {
        type: "image",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/image-4.jpg",
        caption:
          "After Storm <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2022",
      },
      {
        type: "image",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/image-5.JPG",
        caption:
          "Untitled <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2016",
      },
      {
        type: "image",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/image-6.JPG",
        caption:
          "Toilet Paper <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2022",
      },
      {
        type: "video",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/video-1.mp4",
        caption:
          "Cocoa Eggplant Tomato <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2025",
      },
      {
        type: "video",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/video-2.mp4",
        caption:
          "Toilet Paper <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2022",
      },
      {
        type: "video",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/video-3.MP4",
        caption:
          "Production Fun Fact (Eggs) <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2024",
      },
      {
        type: "image",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/image-7.jpg",
        caption:
          "Toilet Paper <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2022",
      },
      {
        type: "image",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/image-8.jpg",
        caption:
          "Toilet Paper <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2022",
      },
      {
        type: "image",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/image-9.jpg",
        caption:
          "Toilet Paper <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2022",
      },
      {
        type: "image",
        detail:
          "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.",
        src: "/static/img/page1/image-10.jpg",
        caption:
          "Toilet Paper <br>12 x 16 inch C type hand print <br>Edition of 1 Plus an additional artist Proof <br>2022",
      },
    ];
    this.data = [
      { x: -110, y: 18, w: 500, h: 370 },
      { x: 530, y: 255, w: 350, h: 460 },
      { x: 831, y: 158, w: 200, h: 300 },
      { x: 1891, y: 220, w: 300, h: 220 },
      { x: 1974, y: 687, w: 260, h: 290 },
      { x: 2323, y: 824, w: 205, h: 400 },
      { x: 911, y: 540, w: 260, h: 350 },
      { x: 1251, y: 803, w: 500, h: 300 },
      { x: 1371, y: 422, w: 350, h: 260 },
      { x: -67, y: 444, w: 350, h: 260 },
      { x: 511, y: 922, w: 350, h: 260 },
      { x: 911, y: 1230, w: 350, h: 260 },
      { x: 1311, y: 23, w: 350, h: 260 },
      { x: 1711, y: 922, w: 280, h: 360 },
    ];
    // 获取id为hero的元素，设置背景为一段视频src\static\img\page1\bg1.MP4
    // const hero = document.querySelector("#hero");
    // hero.style.background = `url('../../static/img/page1/bg1.MP4') no-repeat center center`;
    // hero.style.backgroundSize = "cover";
    // hero.style.backgroundPosition = "center";
    // hero.style.backgroundRepeat = "no-repeat";
    // hero.style.backgroundAttachment = "fixed";
    // hero.style.backgroundBlendMode = "multiply";
    // hero.style.backgroundOpacity = "0.5";
    // hero.style.backgroundFilter = "blur(10px)";
    // hero.style.backgroundBlur = "10px";
    new InfiniteGrid({
      el: document.querySelector("#images"),
      sources: this.sources,
      data: this.data,
      originalSize: { w: 2560, h: 1440 },
    });

    // Setup back button
    this.setupBackButton();
  }

  setupBackButton() {
    const backButton = document.querySelector("#backButton");
    if (!backButton) return;

    backButton.addEventListener("click", () => {
      // Try to find the main page tab by checking window.opener or localStorage
      const mainPageUrl = window.location.origin + "/src/main.js";
      const mainPageHtmlUrl = window.location.origin + "/index.html";

      // First, try to focus on the opener window if it exists and is not closed
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.focus();
          window.close();
          return;
        } catch (e) {
          console.log("Could not access opener:", e);
        }
      }

      // If opener doesn't exist or is closed, try to open the main page
      // Store a flag in sessionStorage so main page knows it was opened from a sub-page
      sessionStorage.setItem("returnedFromSubPage", "true");

      // Open main page in current tab
      window.location.href = mainPageHtmlUrl;
    });
  }

  resize() {
    document.documentElement.style.setProperty(
      "--rvw",
      `${document.documentElement.clientWidth / 100}px`
    );
  }
}
window.addEventListener("load", () => {
  new Index();
});
