'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

const renderCountry = function (data, className = '') {
  const html = `
    <article class="country ${className}">
      <img class="country__img" src="${Object.values(data?.flags)[0]}" />
      <div class="country__data">
        <h3 class="country__name">${Object.values(data?.name)[0]}</h3>
        <h4 class="country__region">${data?.region}</h4>
        <p class="country__row"><span>👫</span>${(
          +data?.population / 1000000
        ).toFixed(1)}m people</p>
        <p class="country__row"><span>🗣️</span>${
          Object.values(data?.languages)[0]
        }</p>
        <p class="country__row"><span>💰</span>${
          Object.values(data?.currencies)[0]?.name
        }</p>
      </div>
    </article>
    `;

  countriesContainer.insertAdjacentHTML('beforeend', html);
};

const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        resolve(position);
      },
      function (err) {
        reject(err);
      }
    );
  });
};

const whereAmI = function () {
  getPosition()
    .then((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      return fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
    })

    .then(function (response) {
      if (!response.ok)
        throw new Error(`Problem with geocoding ${response.status}`);
      return response.json();
    })
    .then(function (data) {
      return fetch(`https://restcountries.com/v3.1/name/${data?.countryName}`);
    })
    .then(function (response) {
      if (!response.ok) throw new Error(`Country not found ${response.status}`);
      return response.json();
    })
    .then(function (data) {
      renderCountry(data[0]);

      const neighbour = data[0]?.borders[0];

      if (!neighbour) throw new Error('No neighbour found!');

      return fetch(`https://restcountries.com/v3.1/alpha/${neighbour}`);
    })
    .then(function (response) {
      if (!response.ok)
        throw new Error(`neighbour not found (${response.status})`);

      return response.json();
    })
    .then(function (data) {
      renderCountry(data[0], 'neighbour');
    })
    .catch(function (err) {
      console.error(`${err.message} 💥`);
    })
    .finally(function () {
      countriesContainer.style.opacity = 1;
    });
};

btn.addEventListener('click', function () {
  whereAmI();
  btn.style.visibility = 'hidden';
});
