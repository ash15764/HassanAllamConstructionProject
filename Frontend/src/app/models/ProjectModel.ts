export interface ProjectModel {
    id: string;
    name: string;
    status: 'planning' | 'in-progress' | 'completed';
    phase: string;
    startDate: string;
    estimatedEndDate: string;
    allocatedBudget: number;
    currentSpend: number;
    progress: number;
    organization: string;
    ownerId: string;
}