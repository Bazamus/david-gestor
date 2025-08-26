import { Moment } from 'moment';

export interface TimelineItem {
  id: string;
  title: string;
  start_time: Moment;
  end_time: Moment;
  group: string;
  color?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  description?: string;
  assignee?: string;
  tags?: string[];
  projectId?: string;
  type: 'project' | 'task';
}

export interface TimelineGroup {
  id: string;
  title: string;
  rightTitle?: string;
  stackItems?: boolean;
  height?: number;
  color?: string;
}

export interface TimelineFilters {
  dateRange: {
    start: Moment;
    end: Moment;
  };
  quickFilter: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  view: 'projects' | 'tasks' | 'kpis';
  search?: string;
}

export interface TimelineKPIsData {
  activeProjects: number;
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalTasks: number;
  averageProgress: number;
  upcomingDeadlines: number;
  criticalDeadlines: number;
}

export interface TimelineDetail {
  item: TimelineItem;
  isOpen: boolean;
  onClose: () => void;
} 