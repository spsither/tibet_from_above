import TimeSlices from '@/components/TimeSlices';

const descriptionBySlug = {
  drepung: "Drepung Monastery was founded by Jamyang Choje in 1416, 8 km west of Lhasa. The monastery was known as Tibet's largest, housing up to 10,000 monks by the early 17th century. It especially gained power because of its proximity to Nechung Monastery, the seat of Tibet's main Nechung Oracle.",
  sera: 'Sera Monastery was founded in 1419 by disciple of Tsongkhapa, Jamchen Choje Shakya Yeshe, at the base of Mount Purbuchok in Lhasa. It is one of the most renowned sites for Geluk Tibetan Buddhist education and practice and was at its peak enrollment the second largest monastery in the world.',
  potala: "Potala Palace, a UNESCO World Heritage Site, is located on top of the Red Mountain in Lhasa and represents the historic seat of the political and religious central Tibetan administration. The construction of the original structure was completed by Tibet's first king, Songtsen Gampo, in 637. Until the mid-1900s, the Potala served as the main palace of the Dalai Lama incarnation line.",
  jokhang: "The Jokhang, also known as the “Great Temple,” is a center of Tibetan Buddhist spiritual practice and pilgrimage located in the center of the capital city of Lhasa. The Temple was commissioned by Tibet's first king, Songtsen Gampo, in the early 7th century. It is said to have be the pinnacle of Tibetan Buddhism's geomantic geography, established to quell the supine ogress that embodies Tibet's physical landscape.",
  tashi_lhunpo: 'Tashi Lhunpo Monastery in Shigatse is the historic seat of the Panchen Lama incarnation line. It was founded in 1447 by the First Dalai Lama and remains today as one of the most well-known Geluk monasteries in Tibet.',
  ganden: 'Ganden Namgyeling (Tib. ri bo dga’ ldan) was Tibet’s first Geluk monastery, founded in 1409 by the Tibetan Buddhist monk and philosopher, Tsongkhapa. The Monastery was destroyed in 1966 and throughout the years following. Local monks began to restore the monastery with donations and volunteer labor in the early 1980s, and the Chinese government shifted from prohibiting to supporting the restoration by 1986. With its rebuilt structure, Ganden remains as one of the three main Geluk Monasteries in Tibet, located about 40 km outside of Lhasa.', 
  narthang: 'Nartang Monastery (Tib. sNar thang) was founded in 1153 by Tumton Lodro Drakpa in a village about 260 km west of Shigatse. It was founded as a Kadampa monastery and school and later became a subsidiary of Tashilhunpo Monastery in the 15th century. Nartang was renowned for its printing press, which produced copies of the religious scriptures, the Tenjur and Kanjur, until its destruction in the late 1960s.'
};



const slicesBySlug = {
  ganden: [
    { image: '/images/Ganden 1963 U2.jpg', label: '1963' },
    { image: '/images/Ganden 1969 Corona.jpg', label: '1969' },
    { image: '/images/Ganden 1972 Hexagon.jpg', label: '1972' }
  ],
  potala: [
    { image: '/images/Potala 1959 U2.jpg', label: '1959' },
    { image: '/images/Potala 1968 Corona.jpg', label: '1968' },
    { image: '/images/Potala 1982 Hexagon.jpg', label: '1982' }
  ],
  drepung: [
    { image: '/images/Drepung 1959 U2.jpg', label: '1959' },
    { image: '/images/Drepung 1968 Corona.jpg', label: '1968' },
    { image: '/images/Drepung 1982 Hexagon.jpg', label: '1982' }
  ],
  jokhang: [
    { image: '/images/Jokhang 1959 U2.jpg', label: '1959' },
    { image: '/images/Jokhang 1968 Corona.jpg', label: '1968' },
    { image: '/images/Jokhang 1982 Hexagon.jpg', label: '1982' }
  ],
  sera: [
    { image: '/images/Sera 1959 U2.jpg', label: '1959' },
    { image: '/images/Sera 1968 Corona.jpg', label: '1968' },
    { image: '/images/Sera 1982 Hexagon.jpg', label: '1982' }
  ],
  tashi_lhunpo: [
    { image: '/images/Tashi Lhunpo 1962 U2.jpg', label: '1962' },
    { image: '/images/Tashi Lhunpo 1968 Corona.jpg', label: '1968' },
    { image: '/images/Tashi Lhunpo 1972 Hexagon.jpg', label: '1972' }
  ],
  narthang: [
    // { image: '/images/Narthang 1959 U2.jpg', label: '1959' },
    // { image: '/images/Narthang 1965 Corona.jpg', label: '1965' },
    // { image: '/images/Narthang 1968 Corona.jpg', label: '1968' },
    // { image: '/images/Narthang 2025 Google Earth.jpg', label: '2025' },
    // { image: '/images/Narthang 2025 Studio Nyandak.jpg', label: '2025 SN' }

    { image: '/images/Nartang-1959_U2.jpg', label: '1959' },
    { image: '/images/Nartang-1968_Corona.jpg', label: '1968' },
    { image: '/images/Nartang-2011_Google Earth.jpg', label: '2011' },
    { image: '/images/Nartang-2025_Google Earth.jpg', label: '2025 GE' },
    { image: '/images/Nartang-2025_Studio Nyandak.jpg', label: '2025 SN' }
  ],
};



export default async function Page({ params }) {
  const { slug } = await params;
  const slices = slicesBySlug[slug];
  const description = descriptionBySlug[slug] || '';
  const notFound = () => {
    throw new Response('Not Found', { status: 404 });
  };
  if (!slices) {
    notFound();
  }

  return (
    <>
      <TimeSlices slices={slices} description={description}/>
    </>
  );
}