import TimeSlices from '@/components/TimeSlices';
export default function Page() {

    const slices = [
        { image: '/images/Ganden - 2006 - Google Earth.jpg', label: '2006' },
        { image: '/images/Ganden - 2007 - Google Earth.jpg', label: '2007' },
        { image: '/images/Ganden - 2009 - Google Earth.jpg', label: '2009' },
        { image: '/images/Ganden - 2010 - Google Earth.jpg', label: '2010' },
        { image: '/images/Ganden - 2017 - Google Earth.jpg', label: '2017' },
        { image: '/images/Ganden - 2021 - Google Earth.jpg', label: '2021' },
        { image: '/images/Ganden - 2024 - Google Earth.jpg', label: '2024' }
    ]
    return (

        <TimeSlices slices={slices} />

    );
}
