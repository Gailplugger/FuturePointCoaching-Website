'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';

interface FacultyCardProps {
  name: string;
  designation: string;
  subject: string;
  experience: string;
  image: string;
  description: string;
  qualifications: string[];
  specializations: string[];
  index?: number;
}

export function FacultyCard({
  name,
  designation,
  subject,
  experience,
  image,
  description,
  qualifications,
  specializations,
  index = 0,
}: FacultyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <Card className="h-full">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <Badge variant="success" className="mb-2">
                {experience}
              </Badge>
              <h3 className="text-xl font-bold text-white">{name}</h3>
              <p className="text-accent-orange font-medium">{designation}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>

            {/* Qualifications */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Qualifications</h4>
              <div className="flex flex-wrap gap-2">
                {qualifications.map((qual) => (
                  <Badge key={qual} variant="info">
                    {qual}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec) => (
                  <Badge key={spec} variant="warning">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
