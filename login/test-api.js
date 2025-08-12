const API_KEY = 'AIzaSyBIHrmvxVt1iKv8ZqBI5TRBZimYsmeKrEE';

async function testYouTubeAPI() {
  try {
    console.log('Testando API do YouTube...');
    
    // Teste 1: Buscar vídeos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&q=teste&type=video&maxResults=1`;
    console.log('Buscando vídeos...');
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.items && searchData.items.length > 0) {
      const videoId = searchData.items[0].id.videoId;
      const channelId = searchData.items[0].snippet.channelId;
      
      console.log('Vídeo encontrado:', searchData.items[0].snippet.title);
      console.log('Channel ID:', channelId);
      
      // Teste 2: Buscar estatísticas do canal
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&part=snippet,statistics&id=${channelId}`;
      console.log('Buscando dados do canal...');
      const channelResponse = await fetch(channelUrl);
      const channelData = await channelResponse.json();
      
      console.log('Dados do canal:', channelData);
      
      if (channelData.items && channelData.items.length > 0) {
        const channel = channelData.items[0];
        console.log('Nome do canal:', channel.snippet.title);
        console.log('Inscritos:', channel.statistics?.subscriberCount || 'N/A');
        console.log('Total de views:', channel.statistics?.viewCount || 'N/A');
        console.log('Total de vídeos:', channel.statistics?.videoCount || 'N/A');
      }
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testYouTubeAPI();

<<<<<<< HEAD

=======
>>>>>>> c14af1105adcad036b4e6979e1017aa14437bc53
