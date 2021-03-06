const itemsContainer = document.querySelector('.items');
const cartItemsContainer = document.querySelector('.cart__items');
const cartPriceContainer = document.querySelector('.total-price');
const buttonCartRemover = document.querySelector('.empty-cart');
const inputSearch = document.querySelector('.input-search');
const buttonSearch = document.querySelector('.button-search');

function removeCartItems() {
  // Aqui eu resolvi usar o método Array.from, para converter o HTMLCollection advindo do método getElementsByClassName em um Array e poder iterá-lo com o forEach.
  // Agradecimento aos usuários 'EscapeNetscape' e 'harpo' do Stackoverflow pela solução!

  const arrayOfCartItems = Array.from(document.getElementsByClassName('cart__item'));
  arrayOfCartItems.forEach((cartItem) => cartItem.remove());
  localStorage.setItem('actualCart', cartItemsContainer.innerHTML);
  cartPriceContainer.innerText = 0;
  localStorage.setItem('actualPrice', 0);
}

buttonCartRemover.addEventListener('click', removeCartItems);

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function subtractCartItems(event) {
  const filteredPrice = parseFloat(event.target.innerText.split('$')[1], 10);
  cartPriceContainer.innerText = Math.round((parseFloat(cartPriceContainer.innerText, 10)
   - filteredPrice) * 100) / 100;
  localStorage.setItem('actualPrice', cartPriceContainer.innerText);
}

function cartItemClickListener(event) {
  subtractCartItems(event);
  event.target.remove();
  localStorage.setItem('actualCart', cartItemsContainer.innerHTML);
}

function createCartItemElement({ id, title, price }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${id} | NAME: ${title} | PRICE: $${price}`;
  return li;
}

function sumCartItems(price) {
  cartPriceContainer.innerText = Math.round((parseFloat(cartPriceContainer.innerText, 10)
   + price) * 100) / 100;
  localStorage.setItem('actualPrice', cartPriceContainer.innerText);
}

function fetchCartItem(event) {
  fetch(`https://api.mercadolibre.com/items/${getSkuFromProductItem(event.target.parentNode)}`)
  .then((response) => response.json())
  .then((jsonData) => {
    cartItemsContainer.appendChild(createCartItemElement(jsonData));
    localStorage.setItem('actualCart', cartItemsContainer.innerHTML);
    sumCartItems(jsonData.price);
    localStorage.setItem('actualPrice', cartPriceContainer.innerText);
  });
}

function addLoading() {
  const loadingGif = createProductImageElement('./loading-gif.gif');
  loadingGif.className = 'loading';
  loadingGif.width = '50%';
  itemsContainer.appendChild(loadingGif);
}

function removeLoading() {
  itemsContainer.querySelector('.loading').remove();
}

function createProductItemElement({ id, title, thumbnail }) {
  const section = document.createElement('section');
  const img = thumbnail.replace(/-I.jpg/g, '-O.jpg');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', id));
  section.appendChild(createCustomElement('span', 'item__title', title));
  section.appendChild(createProductImageElement(img));
  const buttonAddToCart = createCustomElement('button', 'item__add', 'Adicionar ao carrinho!');
  buttonAddToCart.addEventListener('click', fetchCartItem);
  section.appendChild(buttonAddToCart);

  return section;
}

function eraseItemsContainer() {
  const arrayOfItems = Array.from(document.getElementsByClassName('item'));
  if (arrayOfItems.length > 0) arrayOfItems.forEach((item) => item.remove());
}

function fetchSearch() {
  eraseItemsContainer();
  addLoading();
  const searchTerm = inputSearch.value;
  fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${searchTerm}`)
  .then((response) => response.json())
  .then((jsonData) => {
    jsonData.results.forEach((product) => 
    itemsContainer.appendChild(createProductItemElement(product)));
    removeLoading();
  });
}

// Habilitando o click no botão de pesquisar e o botão "Enter" para também efetivar a pesquisa.

buttonSearch.addEventListener('click', fetchSearch);
inputSearch.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') fetchSearch();
});

// Aqui adicionei um event listener na página toda executando uma função para capturar quando o evento for realizado em algum item no carrinho, pois ao carregar o carrinho pelo localStorage não era possível removê-lo ao clicar em cima. 
// Feito com a grande ajuda do Bruno Yamamoto da Turma 12 da Trybe!

document.addEventListener('click', (event) => {
  if (event.target.className === 'cart__item') {
    cartItemClickListener(event);
  }
});

function fetchWithTerm(term) {
  eraseItemsContainer();
  addLoading();
  fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${term}`)
  .then((response) => response.json())
  .then((jsonData) => {
    jsonData.results.forEach((product) => 
    itemsContainer.appendChild(createProductItemElement(product)));
    removeLoading();
  });
}

window.onload = function onload() {
  cartItemsContainer.innerHTML = localStorage.getItem('actualCart');
  if (localStorage.getItem('actualPrice')) {
    cartPriceContainer.innerText = localStorage.getItem('actualPrice');
  } else {
    cartPriceContainer.innerText = 0;
  }
  fetchWithTerm('Ryzen 5');
};
