import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import SectionTitle from '../Common/SectionTitle/SectionTitle';
import TestimonialCard from '../Common/TestimonialCard/TestimonialCard';
import { SkeletonTestimonialCard } from '../Common/Skeleton/Skeleton';
import { TESTIMONIALS_DATA } from '../../data/mockData';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './Testimonials.css';

const Testimonials = ({ isLoading = false }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section id="testimonials" className="section-padding testimonials-section">
      <div className="container">
        <div className="testimonials-header-bar">
          <SectionTitle
            badge="CLIENT TESTIMONIALS"
            title="What Our Buyers Say"
            subtitle="Real stories from families, NRI investors, and plot buyers who built their dream properties with Anugraha Developers."
            align="left"
            className="mb-0"
            style={{ marginBottom: 0 }}
          />
        </div>

        <div className="testimonials-swiper-container">
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {Array.from({ length: 3 }).map((_, idx) => (
                <SkeletonTestimonialCard key={idx} />
              ))}
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              autoplay={{ delay: 4500, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              breakpoints={{
                768: {
                  slidesPerView: 2,
                },
                1200: {
                  slidesPerView: 3,
                },
              }}
            >
              {TESTIMONIALS_DATA.map((item) => (
                <SwiperSlide key={item.id}>
                  <TestimonialCard testimonial={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
