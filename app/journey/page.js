import JourneyThroughTime from '@/components/JourneyThroughTime';
export default function Page() {

    const items = [
        { image: '/images/Ganden - 1963 - U2.jpg', label: 'Ganden - 1963', description: 'Before the imperial Chinese forces destroyed Ganden we have a sacred monastery untouched by modernization and the CCP. Existing in the same form for centuries.' },
        { image: '/images/Ganden - 1976 - Hexagon.png', label: 'Ganden - 1976', description: 'After the devastating destruction during the Cultural revolution we can see the monastery has been destroyed off of the mountain.' },
        { image: '/images/Ganden - 2006 - Google Earth.jpg', label: 'Ganden - 2006', description: 'During relaxed period of Hu Jintao we can see the Ganden being rebuild' },
        { image: '/images/Ganden - 2024 - Google Earth.jpg', label: 'Ganden - 2024', description: 'At present Ganden has been rebuild but under tight control' },
    ];

    return (
        <JourneyThroughTime items={items} />
    );
}
