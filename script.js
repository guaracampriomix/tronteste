// Declaração das lojas com coordenadas
const lojas = [
  { 
    nome: "RIO SUL", 
    lat: -22.798465383728914, 
    lng: -43.644806268176616, 
    endereco: "Estr. Rio São Paulo, 1380 - Campo Lindo, Seropédica - RJ, 23890-000"
  },
  { 
    nome: "RIO SUL", 
    lat: -22.74137499494114, 
    lng: -43.48521255254507, 
    endereco: "R. Tomás Fonseca, 500 - Comendador Soares, Nova Iguaçu - RJ, 26280-376"
  },
  { 
    nome: "ADONAI", 
    lat: -22.846318250530064, 
    lng: -43.32485432192923, 
    endereco: "R. Cisplatina, 9 - 11 - Irajá, Rio de Janeiro - RJ, 21235-070"
  },
  { 
    nome: "BALCÃO MENDANHA", 
    lat: -22.858360780252575, 
    lng: -43.541599754301764, 
    endereco: "Estr. do Mendanha, 4489 - Campo Grande, Rio de Janeiro - RJ, 23095-842"
  }
];

// Variável para o serviço de Distância do Google Maps
let service;

// Função chamada quando a API do Google Maps é carregada
function initMap() {
  service = new google.maps.DistanceMatrixService();
  console.log("Google Maps API carregada corretamente");
}

// Manipulação do formulário para buscar lojas
document.getElementById("locationForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const selectedRegion = document.getElementById("region").value;
  if (!selectedRegion) {
      alert("Selecione um bairro antes de buscar as lojas.");
      return;
  }
  const [userLat, userLng] = selectedRegion.split(",").map(Number);
  displayResults(userLat, userLng);
});

// Função para usar a localização atual do usuário
document.getElementById("useCurrentLocation").addEventListener("click", () => {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;
              displayResults(userLat, userLng);
          },
          (error) => {
              alert("Não foi possível obter sua localização. Por favor, tente novamente.");
          }
      );
  } else {
      alert("Seu navegador não suporta geolocalização.");
  }
});

// Função que exibe os resultados da pesquisa
function displayResults(userLat, userLng) {
  const userLocation = new google.maps.LatLng(userLat, userLng);
  const destinations = lojas.map(loja => new google.maps.LatLng(loja.lat, loja.lng));
  const resultsDiv = document.getElementById("results");

  // Configura a requisição para a API do Google Distance Matrix
  service.getDistanceMatrix({
      origins: [userLocation],
      destinations: destinations,
      travelMode: google.maps.TravelMode.DRIVING,
  }, (response, status) => {
      if (status === "OK") {
          const distances = response.rows[0].elements.map((element, index) => ({
              nome: lojas[index].nome,
              endereco: lojas[index].endereco,
              distancia: element.distance ? element.distance.value / 1000 : null, // Converter para km
              duration: element.duration ? element.duration.text : "N/A",
              lat: lojas[index].lat,
              lng: lojas[index].lng
          }));

          // Filtra resultados inválidos e ordena por distância
          const validDistances = distances.filter(loja => loja.distancia !== null);
          validDistances.sort((a, b) => a.distancia - b.distancia);

          // Exibe os resultados no HTML
          resultsDiv.innerHTML = "<h2>Lojas mais próximas:</h2>" +
              validDistances.map(loja => `
                  <div>
                      <p><strong>${loja.nome}</strong></p>
                      <p>${loja.endereco}</p>
                      <p>Distância: ${loja.distancia.toFixed(2)} km</p>
                      <p>Tempo estimado: ${loja.duration}</p>
                      <a href="https://www.google.com/maps?q=${loja.lat},${loja.lng}" target="_blank">
                          <button class="directions-button">Como Chegar</button>
                      </a>
                  </div>
              `).join("");
      } else {
          alert("Erro ao calcular distâncias: " + status);
      }
  });
}
