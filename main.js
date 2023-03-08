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

const view = {
  getCardElement(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `<div class="card">
        <p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>
      </div>`;
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

  displayCard() {
    const AllCardsElement = document.querySelector("#cards");
    AllCardsElement.innerHTML = Array.from(Array(52).keys())
      .map((index) => this.getCardElement(index))
      .join("");
  },
};

view.displayCard();
