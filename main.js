// displayCards - 負責選出 #cards 並抽換內容
// getCardElement - 負責生成卡片內容，包括花色和數字
// 0-12：黑桃 1-13
// 13-25：愛心 1-13
// 26-38：方塊 1-13
// 39-51：梅花 1-13

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];

//! 遊戲流程設計：狀態機
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardMatchFailed: "CardMatchFailed",
  CardMatchedSuccess: "CardMatchedSuccess",
  GameFinished: "GameFinished",
};
let currentState = GAME_STATE.FirstCardAwaits;
let revealedCards = [];
let score = 0;

//!渲染視覺效果
const view = {
  //!牌的正面
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `
        <p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>
      `;
  },

  //!牌的背面
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`;
  },
  //! 配對成功添加classList
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  displayCard(indexes) {
    const AllCardsElement = document.querySelector("#cards");
    AllCardsElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },
  //! 翻牌函式
  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        //! 回傳正面
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      //! 回傳背面
      card.classList.add("back");
      card.innerHTML = null;
    });
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },
  //! 配對失敗動畫
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (event) => event.target.classList.remove("wrong"),
        { once: true }
      );
    });
  },
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  },
  //! view的底部
};

//! 洗牌演算法設計
const utility = {
  getRandomNumberArray(count) {
    //*製作撲克牌數列
    const number = Array.from(Array(count).keys());
    //* 選定想交換的位置 >>> index = number.length - 1 代表取出最後一項
    //* 迴圈 index 往下數
    for (let index = number.length - 1; index > 0; index--) {
      //* randomIndex = 選定想交換的位置 >>> 找到一個隨機項目
      let randomIndex = Math.floor(Math.random() * (index + 1));
      //* 交換陣列元素 － 解構賦值語法
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

//!定義遊戲狀態
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCard(utility.getRandomNumberArray(52));
  },

  //! 翻牌失敗重置卡片
  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },

  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      //! 第一狀態
      case GAME_STATE.FirstCardAwaits:
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        return;
      //! 第二狀態
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        //! 判斷配對是否成功
        if (model.isRevealCardMatched()) {
          //! 配對成功
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardMatchedSuccess;

          view.pairCards(...model.revealedCards);
          model.revealedCards = [];
          //! 結束動畫函式
          if (model.score === 260) {
            console.log("showGameFinished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          //! 配對失敗
          this.currentState = GAME_STATE.CardMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
  },
};

const model = {
  //*代表被翻開的卡片
  revealedCards: [],
  isRevealCardMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },
  score: 0,
  triedTimes: 0,
};

//!呼叫渲染畫面函式
controller.generateCards();

//! 加上事件監聽器
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
