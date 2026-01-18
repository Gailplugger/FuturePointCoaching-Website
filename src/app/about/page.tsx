import type { Metadata } from 'next';
import { faculty, siteConfig } from '@/lib/constants';
import { FacultyCard } from '@/components/FacultyCard';
import { PageTransition, SlideUp } from '@/components/motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Target, BookOpen, Heart, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn about ${siteConfig.name} - our mission, faculty, and commitment to student success.`,
};

const values = [
  {
    icon: Target,
    title: 'Mission',
    description:
      'To provide quality education that empowers students to achieve their academic goals and build successful careers.',
  },
  {
    icon: BookOpen,
    title: 'Vision',
    description:
      'To be the leading coaching institute in the region, known for excellence in education and student outcomes.',
  },
  {
    icon: Heart,
    title: 'Values',
    description:
      'Integrity, dedication, and student-centered approach guide everything we do.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description:
      'We strive for academic excellence and help students reach their full potential.',
  },
];

export default function AboutPage() {
  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-dark">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <SlideUp>
              <span className="inline-block px-4 py-2 bg-accent-orange/20 text-accent-orange rounded-full text-sm font-medium mb-6">
                About Us
              </span>
            </SlideUp>
            <SlideUp delay={0.1}>
              <h1 className="heading-1 mb-6">
                Building <span className="text-gradient">Future Leaders</span>
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="text-xl text-gray-300">
                {siteConfig.name} is dedicated to providing exceptional education
                and guidance to students preparing for board exams and competitive
                entrances.
              </p>
            </SlideUp>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-navy-900/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Core Values</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              These principles guide our approach to education and student development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <SlideUp key={value.title} delay={index * 0.1}>
                <Card className="h-full">
                  <CardContent className="text-center">
                    <div className="w-14 h-14 bg-accent-orange/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-7 h-7 text-accent-orange" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Expert Faculty</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Meet the dedicated educators who are committed to your academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {faculty.map((member, index) => (
              <FacultyCard key={member.id} {...member} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-navy-900/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-4">Our Story</h2>
            </div>

            <div className="space-y-6 text-gray-300">
              <p>
                {siteConfig.name} was founded with a simple yet powerful vision:
                to provide quality education that transforms students' lives. What
                started as a small coaching center has grown into a trusted
                institution serving hundreds of students every year.
              </p>
              <p>
                Our journey began with Er. Sachin Kumar and Prof. Gautam Sharma,
                two passionate educators who believed that every student deserves
                access to excellent teaching. Their combined expertise in
                Mathematics and Biology laid the foundation for our comprehensive
                coaching programs.
              </p>
              <p>
                Today, we continue to uphold the same values that started our
                journey - dedication to student success, innovative teaching
                methods, and a supportive learning environment. Our students
                consistently achieve excellent results in board exams and
                competitive entrances like IIT-JEE and NEET.
              </p>
              <p>
                We believe in nurturing not just academic excellence but also
                building character and confidence in our students. Our personalized
                approach ensures that each student receives the attention and
                guidance they need to succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '2023', label: 'Founded' },
              { value: '500+', label: 'Students Coached' },
              { value: '2+', label: 'Years of Excellence' },
              { value: '100%', label: 'Success Rate' },
            ].map((stat, index) => (
              <SlideUp key={stat.label} delay={index * 0.1}>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-bold text-accent-orange mb-2">
                    {stat.value}
                  </p>
                  <p className="text-gray-400">{stat.label}</p>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
