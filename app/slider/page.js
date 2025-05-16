import BeforeAfterSlider from '@/components/BeforeAfterSlider';
export default function Page() {
    return (

        <BeforeAfterSlider
            before="/images/Sera 1959 U2.jpg"
            after="/images/Sera 1982 Hexagon.jpg"
            alt="Before and After Comparison"
            description="Sera Monastery 1959 U2 vs 1982 after the cultural revolution"
            beforeLabel='1959'
            afterLabel='1982'
        />

    );
}
