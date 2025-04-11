import BeforeAfterSlider from '@/components/BeforeAfterSlider';

export default function Page() {
  return (
    <div className="p-4">
      <BeforeAfterSlider
        before="/images/Ganden - 1963 - U2.jpg"
        after="/images/Ganden - 1976 - Hexagon.png"
        alt="Before and After Comparison"
        description="Ganden 1963 U2 vs 1976 after the cultural revolution"
        beforeLabel='1963'
        afterLabel='1976'
      />
    </div>
  );
}
