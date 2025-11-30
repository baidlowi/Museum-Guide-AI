import { Artifact } from './types';

export const ARTIFACS: Artifact[] = [
  {
    id: 'mona-lisa',
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: 'c. 1503–1506',
    period: 'High Renaissance',
    description: 'Mona Lisa adalah lukisan potret setengah badan karya seniman Italia Leonardo da Vinci. Dianggap sebagai mahakarya arketipal dari Renaisans Italia, lukisan ini telah digambarkan sebagai "karya seni yang paling dikenal, paling banyak dikunjungi, paling banyak ditulis, paling banyak dinyanyikan, dan paling banyak diparodikan di dunia".',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    fullDetails: `
      Subjek: Lisa Gherardini, istri Francesco del Giocondo.
      Teknik: Sfumato (pencampuran warna yang lembut tanpa garis atau batas, seperti asap).
      Lokasi Saat Ini: Museum Louvre, Paris.
      Dimensi: 77 cm × 53 cm.
      Fitur Utama: Senyum yang misterius, latar belakang pemandangan yang detail, tidak adanya alis (umum pada era itu atau hilang seiring waktu).
      Sejarah: Dilukis di Florence. Diakuisisi oleh Raja Francis I dari Prancis. Dicuri pada tahun 1911 oleh Vincenzo Peruggia, ditemukan kembali pada tahun 1913.
    `,
    suggestedQuestions: [
      "Mengapa senyumnya begitu terkenal?",
      "Apa itu teknik sfumato?",
      "Ceritakan tentang pencurian tahun 1911.",
      "Apakah ada kode rahasia di matanya?"
    ],
    mapPosition: {
      top: '40%',
      left: '30%',
      roomName: 'Galeri Renaisans'
    }
  },
  {
    id: 'starry-night',
    title: 'Malam Berbintang (The Starry Night)',
    artist: 'Vincent van Gogh',
    year: '1889',
    period: 'Pasca-Impresionis',
    description: 'Malam Berbintang adalah lukisan cat minyak di atas kanvas karya pelukis Pasca-Impresionis Belanda Vincent van Gogh. Dilukis pada Juni 1889, lukisan ini menggambarkan pemandangan dari jendela kamar rumah sakit jiwanya di Saint-Rémy-de-Provence yang menghadap ke timur, tepat sebelum matahari terbit, dengan tambahan sebuah desa imajiner.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1024px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    fullDetails: `
      Lokasi: Museum of Modern Art (MoMA), New York City.
      Konteks: Dibuat saat Van Gogh menjadi pasien di rumah sakit jiwa Saint-Paul-de-Mausole.
      Gaya: Sapuan kuas yang ekspresif, pola berputar, warna kontras yang cerah (biru dan kuning).
      Subjek: Langit malam dengan energi yang bergolak, bulan sabit yang bersinar, dan sebelas bintang. Pohon cemara mendominasi latar depan.
    `,
    suggestedQuestions: [
      "Apa inspirasi lukisan ini?",
      "Mengapa bintang-bintangnya berputar?",
      "Di mana Van Gogh saat melukis ini?",
      "Apa makna dari pohon cemara tersebut?"
    ],
    mapPosition: {
      top: '50%',
      left: '70%',
      roomName: 'Aula Impresionis'
    }
  }
];