export interface ServicePainPoint {
  title: string;
  description: string;
}

export interface ServiceStep {
  number: number;
  title: string;
  description: string;
}

export interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  painPoints: ServicePainPoint[];
  steps: ServiceStep[];
  techStack: string[];
}
