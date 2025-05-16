import TimeSlices from '@/components/TimeSlices';

const descriptionBySlug = {
  drepung: "Drepung Monastery was founded by Jamyang Choje in 1416, 8 km west of Lhasa. The monastery was known as Tibet's largest, housing up to 10,000 monks by the early 17th century. It especially gained power because of its proximity to Nechung Monastery, the seat of Tibet's main Nechung Oracle.",
  sera: 'Sera Monastery was founded in 1419 by disciple of Tsongkhapa, Jamchen Choje Shakya Yeshe, at the base of Mount Purbuchok in Lhasa. It is one of the most renowned sites for Geluk Tibetan Buddhist education and practice and was at its peak enrollment the second largest monastery in the world.',
  potala: "Potala Palace, a UNESCO World Heritage Site, is located on top of the Red Mountain in Lhasa and represents the historic seat of the political and religious central Tibetan administration. The construction of the original structure was completed by Tibet's first king, Songtsen Gampo, in 637. Until the mid-1900s, the Potala served as the main palace of the Dalai Lama incarnation line.",
  jokhang: "The Jokhang, also known as the “Great Temple,” is a center of Tibetan Buddhist spiritual practice and pilgrimage located in the center of the capital city of Lhasa. The Temple was commissioned by Tibet's first king, Songtsen Gampo, in the early 7th century. It is said to have be the pinnacle of Tibetan Buddhism's geomantic geography, established to quell the supine ogress that embodies Tibet's physical landscape.",
  
  ganden: 'Ganden Monastery, founded in 1409 by Tsongkhapa, is one of the three great Gelug monasteries of Tibet. It was located on a mountain overlooking Lhasa and was known for its beautiful architecture and rich history.', 
  tashi_lhunpo: 'Tashi Lhunpo Monastery, founded in 1447 by the first Dalai Lama, is known for its impressive architecture and as the traditional seat of the Panchen Lama.',
  narthang: 'Narthang Monastery, founded in the 11th century, is known for its historical significance as a center for Buddhist learning and translation.'
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
    { image: '/images/Narthang 1959 U2.jpg', label: '1959' },
    { image: '/images/Narthang 1965 Corona.jpg', label: '1965' },
    { image: '/images/Narthang 1968 Corona.jpg', label: '1968' },
    { image: '/images/Narthang 2025 Google Earth.jpg', label: '2025' },
    { image: '/images/Narthang 2025 Studio Nyandak.jpg', label: '2025 SN' }
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