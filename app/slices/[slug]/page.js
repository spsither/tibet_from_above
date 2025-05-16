import TimeSlices from '@/components/TimeSlices';

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
    { image: '/images/Narthang 2025 Studio Nyandak.jpg', label: '2025' }
  ],
};



export default async function Page({ params }) {
  const { slug } = await params;
  const slices = slicesBySlug[slug];

  if (!slices) {
    notFound();
  }

  return (
    <TimeSlices slices={slices} />
  );
}