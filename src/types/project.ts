export interface ProjectMetric {
  value: string;
  label: string;
}

export interface CaseStudy {
  challenge: string;
  solution: string;
  impacts: ProjectMetric[];
  demoHref: string;
  demoLabel: string;
}

export interface Project {
  title: string;
  category: string;
  techStack: string[];
  primaryMetric: ProjectMetric;
  caseStudy?: CaseStudy;
  accentColor: 'blue' | 'emerald' | 'purple' | 'orange';
}
