import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import JourneyThroughTime from '@/components/JourneyThroughTime';
import TimeSlices from '@/components/TimeSlices';
import Link from 'next/link';
export default function Page() {

  const items = [
    { image: '/images/Ganden 1963 U2.jpg', label: 'Ganden - 1963', description: 'Before the imperial Chinese forces destroyed Ganden we have a sacred monastery untouched by modernization and the CCP. Existing in the same form for centuries.' },
    { image: '/images/Ganden 1969 Corona.jpg', label: 'Ganden - 1969', description: 'After the devastating destruction during the Cultural revolution we can see the monastery has been destroyed off of the mountain.' },
    { image: '/images/Ganden 1972 Hexagon.jpg', label: 'Ganden - 1972', description: 'During relaxed period of Hu Jintao we can see the Ganden being rebuild' },
  ];

  const slices = [
    { image: '/images/Jokhang 1959 U2.jpg', label: '1959' },
    { image: '/images/Jokhang 1968 Corona.jpg', label: '1968' },
    { image: '/images/Jokhang 1982 Hexagon.jpg', label: '1982' },
  ]
  return (
    <>
      <BeforeAfterSlider
        before="/images/Sera 1959 U2.jpg"
        after ="/images/Sera 1982 Hexagon.jpg"
        alt="Before and After Comparison"
        description="Sera Monastery 1959 U2 vs 1982 after the cultural revolution"
        beforeLabel='1959'
        afterLabel='1982'
      />

      <JourneyThroughTime items={items} />

      <TimeSlices slices={slices} />

      <div className='flex justify-center'>
        <Link href='map' className="text-blue-600 hover:underline">Map</Link>
        <Link href="https://excalidraw.com/#json=BqQhPzxyFjq3qmx5aNM2C,SrT4-hpnxAgj11LElsZcYg" className='text-blue-600 hover:underline ml-2'>Outline</Link>
      </div>
    </>
  );
}
