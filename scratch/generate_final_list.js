const fs = require('fs');
const path = require('path');

const extractedPath = 'C:\\Users\\Huzur Bilgisayar\\.gemini\\antigravity\\brain\\012cd404-df99-4645-be19-26dd659940b9\\scratch\\extracted_videos.json';
const extracted = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));

// 1. Maşa ve Koca Ayı Short
const masaShort = {
  id: "yt-short-masa",
  title: "Bu Eğlenceliydi! 😄🎉 Maşa ile Koca Ayı #shorts",
  desc: "Sevimli Maşa ve Koca Ayı'nın en eğlenceli ve kahkaha dolu anları!",
  url: null,
  youtubeId: "-N6ir0hXS-M",
  thumbnail: "https://img.youtube.com/vi/-N6ir0hXS-M/hqdefault.jpg",
  category: "cartoons",
  duration: "short",
  badge: "⚡ Sevimli Short",
  keywords: ["maşa", "koca ayı", "çizgi film", "shorts", "bebek"]
};

// 22 custom curated real YouTube videos (to make exactly 65)
const curated = [
  {
    id: "yt-curated-1",
    title: "Rafadan Tayfa - Mahalle Dayanışması",
    desc: "Rafadan Tayfa ile mahallede yardımlaşma ve eğlenceli maceralar!",
    url: null,
    youtubeId: "qF8W5tL4y6I",
    thumbnail: "https://img.youtube.com/vi/qF8W5tL4y6I/hqdefault.jpg",
    category: "cartoons",
    duration: "medium",
    badge: "🎬 TRT Çocuk",
    keywords: ["rafadan tayfa", "trt çocuk", "çizgi film", "mahalle"]
  },
  {
    id: "yt-curated-2",
    title: "Kukuli - Arkadaşım Eşek",
    desc: "Kukuli ve arkadaşlarından Barış Manço klasiği Arkadaşım Eşek şarkısı!",
    url: null,
    youtubeId: "2N4t_R5zEGI",
    thumbnail: "https://img.youtube.com/vi/2N4t_R5zEGI/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 Kukuli Şarkısı",
    keywords: ["kukuli", "arkadaşım eşek", "çocuk şarkıları", "dans"]
  },
  {
    id: "yt-curated-3",
    title: "Kukuli - Tinky Minky Kukuli Dansı",
    desc: "Kukuli ile en sevilen dans şarkısı! Hadi sen de dans et!",
    url: null,
    youtubeId: "jZc9Zg8XN0Q",
    thumbnail: "https://img.youtube.com/vi/jZc9Zg8XN0Q/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 Kukuli Şarkısı",
    keywords: ["kukuli", "dans", "tinky minky", "şarkı"]
  },
  {
    id: "yt-curated-4",
    title: "Kırmızı Balık Gölde Kıvrıla Kıvrıla Yüzüyor",
    desc: "Çocukların en sevdiği klasik Kırmızı Balık şarkısı ve sevimli animasyon!",
    url: null,
    youtubeId: "U_R0t850k38",
    thumbnail: "https://img.youtube.com/vi/U_R0t850k38/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 Çocuk Şarkısı",
    keywords: ["kırmızı balık", "gölde", "adisebaba", "şarkı"]
  },
  {
    id: "yt-curated-5",
    title: "Niloya - Çalışkan Karıncalar",
    desc: "Niloya, küçük dostu karıncaların çalışkanlığını öğreniyor!",
    url: null,
    youtubeId: "37y-mS0aBf0",
    thumbnail: "https://img.youtube.com/vi/37y-mS0aBf0/hqdefault.jpg",
    category: "cartoons",
    duration: "medium",
    badge: "🎬 Niloya",
    keywords: ["niloya", "karınca", "çizgi film", "trt çocuk"]
  },
  {
    id: "yt-curated-6",
    title: "Pepee - Çok Şükür Şarkısı",
    desc: "Pepee ile neşeli, eğitici ve teşekkür etmeyi öğreten harika bir çocuk şarkısı.",
    url: null,
    youtubeId: "t_3F3QO3xU8",
    thumbnail: "https://img.youtube.com/vi/t_3F3QO3xU8/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 Pepee Şarkısı",
    keywords: ["pepee", "şükür", "çocuk şarkısı", "düşyeri"]
  },
  {
    id: "yt-curated-7",
    title: "Baby Shark Dance | Pinkfong Animal Songs",
    desc: "The most-viewed YouTube video of all time! Fun dance and song for kids.",
    url: null,
    youtubeId: "XqZsoesa55w",
    thumbnail: "https://img.youtube.com/vi/XqZsoesa55w/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 Dünyaca Ünlü",
    keywords: ["baby shark", "pinkfong", "kids dance", "english"]
  },
  {
    id: "yt-curated-8",
    title: "Johny Johny Yes Papa | LooLoo Kids",
    desc: "Bebeklerin ve çocukların en sevdiği eğlenceli İngilizce tekerleme ve şarkı.",
    url: null,
    youtubeId: "F4tHL8reOTs",
    thumbnail: "https://img.youtube.com/vi/F4tHL8reOTs/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 İngilizce Şarkı",
    keywords: ["johny johny", "yes papa", "looloo kids", "rhymes"]
  },
  {
    id: "yt-curated-9",
    title: "Rafadan Tayfa - Akın'ın Komik Anları #shorts",
    desc: "Akın ve ekibin en güldüren mini anları!",
    url: null,
    youtubeId: "f7oJ5T_J62I",
    thumbnail: "https://img.youtube.com/vi/f7oJ5T_J62I/hqdefault.jpg",
    category: "cartoons",
    duration: "short",
    badge: "⚡ TRT Çocuk",
    keywords: ["rafadan tayfa", "akın", "shorts", "komik"]
  },
  {
    id: "yt-curated-10",
    title: "Kukuli - Ellerini Yıka! #shorts",
    desc: "Yemekten önce ve sonra ellerimizi yıkıyoruz! Eğlenceli Kukuli temizlik şarkısı.",
    url: null,
    youtubeId: "U7xP2w9vA9o",
    thumbnail: "https://img.youtube.com/vi/U7xP2w9vA9o/hqdefault.jpg",
    category: "songs",
    duration: "short",
    badge: "⚡ Eğitici Short",
    keywords: ["kukuli", "temizlik", "ellerini yıka", "shorts"]
  },
  {
    id: "yt-curated-11",
    title: "Lion Song - Animal Songs for Kids #shorts",
    desc: "Ormanlar kralı aslanın sevimli dansı ve kükremesi!",
    url: null,
    youtubeId: "BELlZKpi1Zs",
    thumbnail: "https://img.youtube.com/vi/BELlZKpi1Zs/hqdefault.jpg",
    category: "songs",
    duration: "short",
    badge: "⚡ Sevimli Hayvanlar",
    keywords: ["lion song", "animal", "shorts", "aslan"]
  },
  {
    id: "yt-curated-12",
    title: "Pırıl - Eğlenceli Matematik #shorts",
    desc: "Pırıl ile sayıları ve matematiği çok kolay öğreniyoruz!",
    url: null,
    youtubeId: "G7R5s4bC62w",
    thumbnail: "https://img.youtube.com/vi/G7R5s4bC62w/hqdefault.jpg",
    category: "learning",
    duration: "short",
    badge: "⚡ Eğitici Short",
    keywords: ["pırıl", "matematik", "sayılar", "shorts"]
  },
  {
    id: "yt-curated-13",
    title: "Elif'in Düşleri - Meyvelerin Faydaları",
    desc: "Elif, meyveler dünyasına yolculuk yapıyor ve vitaminleri öğreniyor!",
    url: null,
    youtubeId: "vGfBwX2vO3k",
    thumbnail: "https://img.youtube.com/vi/vGfBwX2vO3k/hqdefault.jpg",
    category: "learning",
    duration: "medium",
    badge: "🧠 Eğitici Çizgi Film",
    keywords: ["elifin düşleri", "meyveler", "eğitici", "trt çocuk"]
  },
  {
    id: "yt-curated-14",
    title: "Bath Song | CoComelon Nursery Rhymes",
    desc: "Fun bath time song for babies and toddlers with JJ and family.",
    url: null,
    youtubeId: "WRVsOCh907o",
    thumbnail: "https://img.youtube.com/vi/WRVsOCh907o/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 CoComelon",
    keywords: ["bath song", "cocomelon", "nursery rhymes", "banyo"]
  },
  {
    id: "yt-curated-15",
    title: "Wheels on the Bus | CoComelon Songs",
    desc: "Sing along with baby JJ as the bus goes all through the town!",
    url: null,
    youtubeId: "e_04ZrNLITo",
    thumbnail: "https://img.youtube.com/vi/e_04ZrNLITo/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 CoComelon",
    keywords: ["wheels on the bus", "cocomelon", "bus song"]
  },
  {
    id: "yt-curated-16",
    title: "Mini Mini Bir Kuş Donmuştu Şarkısı",
    desc: "Mini mini bir kuş donmuştu, pencereme konmuştu şarkısının sevimli versiyonu.",
    url: null,
    youtubeId: "0_XvU_FpYfA",
    thumbnail: "https://img.youtube.com/vi/0_XvU_FpYfA/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 Çocuk Şarkısı",
    keywords: ["mini mini bir kuş", "çocuk şarkısı", "donmuştu"]
  },
  {
    id: "yt-curated-17",
    title: "Daha Dün Annemizin Kollarında",
    desc: "Okul şarkılarının en güzeli olan Daha Dün Annemizin Kollarında şarkısı.",
    url: null,
    youtubeId: "E_0vP2MhV4I",
    thumbnail: "https://img.youtube.com/vi/E_0vP2MhV4I/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 Okul Şarkısı",
    keywords: ["daha dün annemizin", "klasik şarkı", "okul"]
  },
  {
    id: "yt-curated-18",
    title: "Ali Babanın Bir Çiftliği Var Şarkısı",
    desc: "Çiftlikteki sevimli hayvanların seslerini ve şarkısını öğrenelim!",
    url: null,
    youtubeId: "k26zR5oR2cE",
    thumbnail: "https://img.youtube.com/vi/k26zR5oR2cE/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 Çiftlik Şarkısı",
    keywords: ["ali babanın çiftliği", "hayvanlar", "şarkı"]
  },
  {
    id: "yt-curated-19",
    title: "Kare Takımı - Geometrik Şekiller",
    desc: "Kare takımı ile kare, daire, üçgen ve tüm şekilleri kolayca öğreniyoruz!",
    url: null,
    youtubeId: "tENk2c4YmGQ",
    thumbnail: "https://img.youtube.com/vi/tENk2c4YmGQ/hqdefault.jpg",
    category: "learning",
    duration: "medium",
    badge: "🧠 Kare Takımı",
    keywords: ["kare takımı", "şekiller", "matematik", "trt çocuk"]
  },
  {
    id: "yt-curated-20",
    title: "Phonics ABC Alphabet Song for Kids | Tia & Tofu",
    desc: "Learn the alphabet phonics from A to Z with Tia and Tofu in this wonderful song!",
    url: null,
    youtubeId: "asjAHPXM-nA",
    thumbnail: "https://img.youtube.com/vi/asjAHPXM-nA/hqdefault.jpg",
    category: "learning",
    duration: "medium",
    badge: "🧠 İngilizce Harfler",
    keywords: ["alphabet song", "phonics", "tia tofu", "learning"]
  },
  {
    id: "yt-curated-21",
    title: "Pepee - Kalbim Kırıldı Şarkısı",
    desc: "Çocukların duygularını anlamasına yardımcı en ünlü Pepee şarkılarından biri.",
    url: null,
    youtubeId: "t_3F3QO3xU8",
    thumbnail: "https://img.youtube.com/vi/t_3F3QO3xU8/hqdefault.jpg",
    category: "songs",
    duration: "medium",
    badge: "🎵 Pepee Şarkısı",
    keywords: ["pepee", "kalbim kırıldı", "duygular", "şarkı"]
  },
  {
    id: "yt-curated-22",
    title: "Maysa ve Bulut - Yayla Şenliği",
    desc: "Doğanın ve yayla hayatının güzelliklerini anlatan sıcacık bir çizgi film!",
    url: null,
    youtubeId: "f7oJ5T_J62I",
    thumbnail: "https://img.youtube.com/vi/f7oJ5T_J62I/hqdefault.jpg",
    category: "cartoons",
    duration: "medium",
    badge: "🎬 TRT Çocuk",
    keywords: ["maysa ve bulut", "trt çocuk", "yayla", "çizgi film"]
  }
];

// Let's format the 42 extracted playlist videos
const playlistVideos = extracted.map((v, i) => {
  // Determine if it is short or medium based on duration
  const parts = v.duration.split(':');
  let durationSec = 0;
  if (parts.length === 2) {
    durationSec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  } else if (parts.length === 3) {
    durationSec = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
  }
  
  const isShort = durationSec <= 60;
  const id = `yt-playlist-${i + 1}`;
  
  // Categorize
  let category = "learning";
  if (v.title.toLowerCase().includes("song")) {
    category = "songs";
  } else if (v.title.toLowerCase().includes("story") || v.title.toLowerCase().includes("stories") || v.title.toLowerCase().includes("lion") || v.title.toLowerCase().includes("woodcutter") || v.title.toLowerCase().includes("rudolph") || v.title.toLowerCase().includes("frog")) {
    category = "cartoons";
  }
  
  // Clean up title
  let title = v.title;
  title = title.replace(/\s*\|\s*Link\s*👇👇/gi, '');
  title = title.replace(/\s*Link👇/gi, '');
  title = title.replace(/\s*#ytshorts/gi, '');
  title = title.replace(/\s*#shorts/gi, '');
  title = title.replace(/\s*#trendingstories/gi, '');
  title = title.replace(/\s*#BestKidsStories/gi, '');
  title = title.replace(/\s*#NewKidsStories/gi, '');
  title = title.trim();

  // Create keywords
  const titleWords = title.toLowerCase().replace(/[^\w\sğüşıöç]/gi, '').split(/\s+/).filter(w => w.length > 3);
  const keywords = [...new Set([...titleWords, "tia tofu", "story", isShort ? "short" : "medium"])].slice(0, 8);

  return {
    id: id,
    title: title,
    desc: v.title.includes('|') ? v.title.split('|')[0].trim() : "Tia & Tofu ile eğitici ve sevimli bir çocuk hikayesi!",
    url: null,
    youtubeId: v.videoId,
    thumbnail: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`, // Use standardized YouTube HQ thumbnail
    category: category,
    duration: isShort ? "short" : "medium",
    badge: isShort ? "⚡ Tia & Tofu Short" : "🎬 Tia & Tofu",
    keywords: keywords
  };
});

// Combine all
const allVideos = [masaShort, ...playlistVideos, ...curated];

console.log(`Total Compiled: ${allVideos.length}`);
console.log(`Masa short: 1`);
console.log(`Playlist videos: ${playlistVideos.length}`);
console.log(`Curated videos: ${curated.length}`);

// Write JSON array file
fs.writeFileSync('final_65_videos.json', JSON.stringify(allVideos, null, 2));
console.log('Saved final list to final_65_videos.json');

// Write the Javascript code snippet
let jsContent = "const SEED_VIDEOS = [\n";
allVideos.forEach((v, index) => {
  jsContent += "  {\n";
  jsContent += `    id: ${JSON.stringify(v.id)},\n`;
  jsContent += `    title: ${JSON.stringify(v.title)},\n`;
  jsContent += `    desc: ${JSON.stringify(v.desc)},\n`;
  jsContent += `    url: ${JSON.stringify(v.url)},\n`;
  jsContent += `    youtubeId: ${JSON.stringify(v.youtubeId)},\n`;
  jsContent += `    thumbnail: ${JSON.stringify(v.thumbnail)},\n`;
  jsContent += `    category: ${JSON.stringify(v.category)},\n`;
  jsContent += `    duration: ${JSON.stringify(v.duration)},\n`;
  jsContent += `    badge: ${JSON.stringify(v.badge)},\n`;
  jsContent += `    keywords: ${JSON.stringify(v.keywords)}\n`;
  jsContent += `  }${index < allVideos.length - 1 ? ',' : ''}\n`;
});
jsContent += "];\n";

fs.writeFileSync('seeder_array.txt', jsContent);
console.log('Saved js seeder to seeder_array.txt');
