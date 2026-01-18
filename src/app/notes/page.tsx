'use client';

import { NotesList } from '@/components/NotesList';
import { PageTransition, SlideUp } from '@/components/motion';

export default function NotesPage() {
  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-dark">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <SlideUp>
              <span className="inline-block px-4 py-2 bg-accent-orange/20 text-accent-orange rounded-full text-sm font-medium mb-6">
                Study Materials
              </span>
            </SlideUp>
            <SlideUp delay={0.1}>
              <h1 className="heading-1 mb-6">
                Download <span className="text-gradient">Study Notes</span>
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="text-xl text-gray-300">
                Access comprehensive study materials for all classes and subjects.
                Filter by class and subject to find what you need.
              </p>
            </SlideUp>
          </div>
        </div>
      </section>

      {/* Notes List Section */}
      <section className="section-padding">
        <div className="container">
          <NotesList />
        </div>
      </section>
    </PageTransition>
  );
}
