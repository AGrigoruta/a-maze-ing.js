const CACHE_VERSION = 1;
const CACHE_NAME = `0xMaze-${CACHE_VERSION}`;




var offlineFundamentals = [
  './img/betty.png',
  './img/dino.png',
  './img/george.png',
  './img/tile_grass.png',
  './img/tile_wall.png',
  './img/wood.png',
  './scripts/Enemy.js',
  './scripts/GameEngine.js',
  './scripts/InputEngine.js',
  './scripts/main.js',
  './scripts/Player.js',
  './scripts/Princess.js',
  './scripts/Tile.js',
  './scripts/Utils.js',
  './scripts/Wood.js',
  './styles/main.css',
  './styles/GothamBold.ttf',
  './sounds/game.mp3'
];

self.addEventListener("install", (event)=>{
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache)=>{
        return cache.addAll(offlineFundamentals);
      })
      .then(()=>{
        console.log('install completed');
      })
  );
});

self.addEventListener("fetch", (event)=>{

  if (event.request.method !== 'GET') {

    return;
  }
  event.respondWith(
    caches
      .match(event.request)
      .then((cached)=>{
        var networked = fetch(event.request)
          .then(fetchedFromNetwork, unableToResolve)
          .catch(unableToResolve);

        return cached || networked;

        function fetchedFromNetwork(response) {
          var cacheCopy = response.clone();


          caches
            .open(CACHE_VERSION + 'pages')
            .then((cache)=>{
              cache.put(event.request, cacheCopy);
            })
            .then(()=>{
            });

          return response;
        }

        function unableToResolve () {
          return new Response('<h1>Service Unavailable</h1>', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/html'
            })
          });
        }
      })
  );
});
self.addEventListener("activate", function(event) {

  event.waitUntil(
    caches
      .keys()
      .then((keys)=>{
        return Promise.all(
          keys
            .filter((key)=>{
              return !key.startsWith(CACHE_VERSION);
            })
            .map((key)=>{
              return caches.delete(key);
            })
        );
      })
      .then(()=>{
          
      })
  );
});

