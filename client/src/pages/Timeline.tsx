import React from 'react';
import TimelineDashboard from '../components/timeline/TimelineDashboard';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MobileTimeline } from '@/components/mobile';

const Timeline: React.FC = () => {
  const { isMobile } = useIsMobile();

  if (isMobile) {
    return <MobileTimeline />;
  }

  return <TimelineDashboard />;
};

export default Timeline; 